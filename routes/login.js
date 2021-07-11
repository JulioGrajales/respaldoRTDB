const { Router } = require('express');
const usuariosModelo = require('../models/users');
const router = Router();
const jwt = require('jsonwebtoken');

router.get('/login',async (req,res) => {
  
  const user = await usuariosModelo.findOne({email: req.query.email});
  
  if(!user){
    return res.status(404).send('el email no existe');
  }
  const payload = {
    id: user._id,
    name: user.name,
    contact_id: user.contact_id,
    role: user.role
  };
  
  const token = jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{
    expiresIn: 60 * 15
  });
  res.status(200).send(token);
  
});

module.exports = router;