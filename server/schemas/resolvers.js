const { User, Comments} = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
   Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')

    
        return userData;
      }
    
      throw new AuthenticationError('Not logged in');
    },
    users: async () => {
        return User.find()
          .select('-__v -password')
    },
      user: async (parent, { username }) => {
        return User.findOne({ username })
          .select('-__v -password')

    },
    comments: async (parent, {username}) => {
      const params = username ? {username} : {};
      return Comments.find(params).sort({createdAt: -1});
    },
    comment: async (parent, {_id}) => {
      return Comments.findOne({_id});
    }
      
   },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return {token, user};
    },
    updateUser: async(parent, {id, email}) => {
      const user = await User.findOneAndUpdate(
        {_id: id}, {email}, {new: true});
      
      return user
    },
deleteUser: async(parent, {id}) => {
  const wasDeleted = (await User.deleteOne({_id: id})).deletedCount;
  return wasDeleted
},

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
    
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
    
      const correctPw = await user.isCorrectPassword(password);
    
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user);
      return { token, user };
    },
    addComment: async (parent, args, context) => {
      if (context.user) {
        const comment = await Comments.create({ ...args, username: context.user.username });
    
        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { comments: comment._id } },
          { new: true }
        );
    
        return comment;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    },

    updateComment: async(parent, {id, comment_text}) => {
      const comment = await Comments.findOneAndUpdate(
        {_id: id}, {comment_text}, {new: true});
      
      return comment
    },

    deleteComment: async(parent, {id}) => {
      const wasDeleted = (await Comments.deleteOne({_id: id})).deletedCount;
      return wasDeleted
    },
    
    addFriend: async (parent, { friendId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { friends: friendId } },
          { new: true }
        ).populate('friends');
    
        return updatedUser;
      }
    
      throw new AuthenticationError('You need to be logged in!');
    }
  }
}
  
  module.exports = resolvers;