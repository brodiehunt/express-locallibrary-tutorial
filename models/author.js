const { DateTime } = require('luxon')
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    maxLength: 100
  },
  family_name: {
    type: String,
    required: true,
    maxLength: 100
  },
  date_of_birth: {
    type: Date
  },
  date_of_death: {
    type: Date
  }
});

AuthorSchema.virtual("name").get(function () {
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.first_name} ${this.family_name}`;
  }
  return fullname;
})

AuthorSchema.virtual("birth_date_formatted").get(function () {
  if (this.date_of_birth) {
    return DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)
  }
  return 'N/A';
})

AuthorSchema.virtual("death_date_formatted").get(function () {
  if (this.date_of_death) {
    return DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
  }
  return 'current'
})

AuthorSchema.virtual('lifespan').get(function() {
  return `${this.birth_date_formatted} - ${this.death_date_formatted}`
})

AuthorSchema.virtual('url').get(function () {
  return `/catalog/author/${this._id}`;
})

module.exports = mongoose.model('Author', AuthorSchema);