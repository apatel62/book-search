//import { JwtPayload } from 'jsonwebtoken';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

interface User {
    _id: string;
    username: string;
    email: string;
    bookCount: number;
    savedBooks: string[];
}

interface IUserContext {
    user?: User;
}

interface LoginArgs {
    email: string;
    password: string;
}

interface AddUserArgs {
    username: string;
    email: string;
    password: string;
}

interface SaveBookArgs {
    book: {
        authors: string[];
        description: string;
        title: string;
        bookId: string;
        image?: string;
        link?: string;
    }
}

interface RemoveBookArgs {
    bookId: string;
}

const resolvers = {
    Query: {
        me: async(_parent: unknown, _args: unknown, context: IUserContext) => {
            try {
                if (context.user) {
                    return await User.findOne({_id: context.user._id}).select('-__v -password');
                } else {
                    return;
                }
            } catch (error) {
                console.error('Error fetching user', error);
                throw new Error('Failed to fetch user data');
            }
        },

    },

    Mutation: {
        login: async (_parent: unknown, {email, password}: LoginArgs) => {
            const user = await User.findOne({ email: email});
            if (!user) {
                console.error({ message: "Can't find this user" });
                throw new Error('Failed to find user');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                console.error({ message: "Wrong Password" });
                throw new Error('Wrong Password Entered');
              }
              const token = signToken(user.username, user.password, user._id);
              return ({ token, user });
        },

        addUser: async(_parent: unknown, {username, email, password}: AddUserArgs) => {
            const user = await User.create({username, email, password});
            if (!user) {
                console.error({ message: "Cannot create user" });
                throw new Error('Failed to create user');
              }
            const token = signToken(user.username, user.password, user._id);
            return ({ token, user });
        },

        saveBook: async(_parent: unknown, bookArgs: SaveBookArgs, context: IUserContext) => {
            try {
                if (context.user) {
                    const updatedUser = await User.findOneAndUpdate(
                        { _id: context.user._id},
                        { $addToSet: { savedBooks: bookArgs.book } },
                        { new: true, runValidators: true }
                      );
                      return updatedUser;
                } else {
                    throw new Error('Context user works but failed to save book to user');
                }
              } catch (error) {
                console.log(error);
                console.error({ message: "Cannot save book to user" });
                throw new Error('Failed to save book to user');
              }
        },

        removeBook: async(_parent: unknown, {bookId}: RemoveBookArgs, context: IUserContext) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                  );
                  return updatedUser;
            } else {
                console.error({ message: "Couldn't find user with this id!" });
                throw new Error('Failed to find user with this id');            }
        },

    },

};

export default resolvers;
