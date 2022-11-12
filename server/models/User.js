const { Schema, model, Types } = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(v);
            },
            message: props => `${props.value} is not valid!` 
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 5
      },

    comments:[{
        type: Schema.Types.ObjectId,
        ref: 'Comments'
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
    
},
{
    toJSON: {
    getters: true
    },
  
}
);

// set up pre-save middleware to create password
userSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.virtual('friendCount').get(function() {
    return this.friends.length;
})

const User = model('User', userSchema);

module.exports = User;