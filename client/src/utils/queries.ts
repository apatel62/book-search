import { gql } from '@apollo/client';

export const GET_ME = gql`
  query me {
    me {
      username
      email
      _id
      bookCount
      savedBooks {
        authors
        bookId
        description
        image
        link
        title
      }
    }
  }
`;
