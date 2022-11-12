const { gql } = require('apollo-server-express');

const typeDefs = gql`
type User {
    _id: ID
    username: String
    email: String
    comments: [Comment]
    friends: [User]
    friendCount: Int
    
}
type Comment {
  _id: ID
  comment_text: String
  username: String
  createdAt: String
}
type Auth {
  token: ID!
  user: User
}

type Query {
    me: User  
    users: [User]
    user(username: String!): User
    comments(username: String): [Comment]
    comment(_id: ID!): Comment
}
type Mutation {
  login(email: String!, password: String!): Auth
  addUser(username: String!, email: String!, password: String!): Auth
  updateUser(id: ID!, email: String!): User
  deleteUser(id: ID!): Boolean
  addComment(comment_text: String!): Comment
  updateComment(id: ID!, comment_text: String!): Comment
  deleteComment(id: ID!): Boolean
  addFriend(friendId: ID!): User
    
 }
`;
module.exports = typeDefs;