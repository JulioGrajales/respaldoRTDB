
const mongoose = require('mongoose');
const leadsModel = require('../models/leads');

const obtenerDataLeadstats = async (real_estate_group_id,contact_broker_id) => {

  
  let activeLeads = leadsModel.aggregate(
    [{
      '$match': {
        phase: { '$nin': ['discarded', 'finished'] },
        real_estate_group_id: mongoose.Types.ObjectId(real_estate_group_id),
        contact_broker_id: mongoose.Types.ObjectId(contact_broker_id)
      }
    },
    { '$count': 'count' }]

  );


  let noTracking = leadsModel.aggregate(
    [{
      '$match': {
        comments: [],
        phase: { '$nin': ['discarded', 'finished'] },
        real_estate_group_id: mongoose.Types.ObjectId(real_estate_group_id),
        contact_broker_id: mongoose.Types.ObjectId(contact_broker_id)
      }
    },
    { '$count': 'count' }]


  );


  let operationPhase = leadsModel.aggregate(
    [{
      '$match': {
        phase: 'in-operation',
        real_estate_group_id: mongoose.Types.ObjectId(real_estate_group_id),
        contact_broker_id: mongoose.Types.ObjectId(contact_broker_id)
      }
    },
    { '$group': { _id: { 'operation_phase': '$operation_phase' }, count: { $sum: 1 } } }]



  );


  let profile = leadsModel.aggregate(
    [{
      '$match': {
        phase: { '$nin': ['discarded', 'finished'] },
        real_estate_group_id: mongoose.Types.ObjectId(real_estate_group_id),
        contact_broker_id: mongoose.Types.ObjectId(contact_broker_id)
      }
    },
    { '$group': { _id: { profile: '$profile' }, count: { $sum: 1 } } }]


  );



  let leadPostponed = leadsModel.aggregate(
    [{
      '$match': {
        'postponed.is_postponed': true,
        'postponed.date_at': { '$lte': new Date('2021-06-29T04:59:59.000Z') },
        phase: { '$in': ['active', 'in-operation'] },
        real_estate_group_id: mongoose.Types.ObjectId(real_estate_group_id),
        contact_broker_id: mongoose.Types.ObjectId(contact_broker_id)
      }
    },
    { '$count': 'count' }]


  );



  let leadsByPhase = leadsModel.aggregate(
    [{
      '$match': {
        phase: { '$exists': true },
        real_estate_group_id: mongoose.Types.ObjectId(real_estate_group_id),
        contact_broker_id: mongoose.Types.ObjectId(contact_broker_id)
      }
    },
    { '$group': { _id: { 'phase': '$phase' }, count: { $sum: 1 } } }]


  );



  let tracking_phase = leadsModel.aggregate(
    [{
      '$match': {
        phase: { '$nin': ['discarded', 'finished'] },
        real_estate_group_id: mongoose.Types.ObjectId(real_estate_group_id),
        contact_broker_id: mongoose.Types.ObjectId(contact_broker_id)
      }
    },
    { '$group': { _id: { 'phase': '$tracking_phase' }, count: { $sum: 1 } } }]



  );


  let data = await Promise.all([
    activeLeads,
    noTracking,
    operationPhase,
    profile,
    leadPostponed,
    leadsByPhase,
    tracking_phase
  ]);

  return data;
};

const procesarData = async (reg_id,cb_id) => {

  const arrData = await obtenerDataLeadstats(reg_id,cb_id);

  let activeLeads = arrData[0];
  let noTracking = arrData[1];
  let operationPhase = arrData[2];
  let profile = arrData[3];
  let leadPostponed = arrData[4];
  let leadsByPhase = arrData[5];
  let tracking_phase = arrData[6];

  let data = {
    activeLeads: activeLeads,
    noTracking: noTracking,
    operationPhase: operationPhase,
    profile: profile,
    leadPostponed: leadPostponed,
    leadsByPhase: leadsByPhase,
    tracking_phase: tracking_phase,
    Date: new Date()
  };

  return data;
};

module.exports.procesarData = procesarData;