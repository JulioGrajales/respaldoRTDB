const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AmenitiesSchema = new Schema({
  name: String,
  description: String,
  media: {
    featured_image: {
      name: String,
      alt_text: String,
      src: String,
      cloudinary_id: String
    }
  },
  status: Number
});

module.exports = mongoose.model('amenities', AmenitiesSchema);