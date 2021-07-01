
const mongoose = require('mongoose');

const agregarData = async leadsModel => {

  let activeLeads = leadsModel.aggregate(
    [{
      '$match': {
        phase: { '$nin': ['discarded', 'finished'] },
        real_estate_group_id: mongoose.Types.ObjectId('5e9a2df024535649bdc51f54'),
        contact_broker_id: mongoose.Types.ObjectId('5db30d7c0a23f12a4f069572')
      }
    },
    { '$count': 'count' }]

  );
  // console.log('activeLeads :');
  // console.log(activeLeads);


  let noTracking = leadsModel.aggregate(
    [{
      '$match': {
        comments: [],
        phase: { '$nin': ['discarded', 'finished'] },
        real_estate_group_id: mongoose.Types.ObjectId('5e9a2df024535649bdc51f54'),
        contact_broker_id: mongoose.Types.ObjectId('5db30d7c0a23f12a4f069572')
      }
    },
    { '$count': 'count' }]


  );
  // console.log('noTracking :');
  // console.log(noTracking);

  let operationPhase = leadsModel.aggregate(
    [{
      '$match': {
        phase: 'in-operation',
        real_estate_group_id: mongoose.Types.ObjectId('5e9a2df024535649bdc51f54'),
        contact_broker_id: mongoose.Types.ObjectId('5db30d7c0a23f12a4f069572')
      }
    },
    { '$group': { _id: { 'operation_phase': '$operation_phase' }, count: { $sum: 1 } } }]



  );
  // console.log('operationPhase :');
  // console.log(operationPhase);

  let profile = leadsModel.aggregate(
    [{
      '$match': {
        phase: { '$nin': ['discarded', 'finished'] },
        real_estate_group_id: mongoose.Types.ObjectId('5e9a2df024535649bdc51f54'),
        contact_broker_id: mongoose.Types.ObjectId('5db30d7c0a23f12a4f069572')
      }
    },
    { '$group': { _id: { profile: '$profile' }, count: { $sum: 1 } } }]


  );
  // console.log('profile :');
  // console.log(profile);


  let leadPostponed = leadsModel.aggregate(
    [{
      '$match': {
        'postponed.is_postponed': true,
        'postponed.date_at': { '$lte': new Date('2021-06-29T04:59:59.000Z') },
        phase: { '$in': ['active', 'in-operation'] },
        real_estate_group_id: mongoose.Types.ObjectId('5e9a2df024535649bdc51f54'),
        contact_broker_id: mongoose.Types.ObjectId('5db30d7c0a23f12a4f069572')
      }
    },
    { '$count': 'count' }]


  );
  // console.log('leadPostponed :');
  // console.log(leadPostponed);


  let leadsByPhase = leadsModel.aggregate(
    [{
      '$match': {
        phase: { '$exists': true },
        real_estate_group_id: mongoose.Types.ObjectId('5e9a2df024535649bdc51f54'),
        contact_broker_id: mongoose.Types.ObjectId('5db30d7c0a23f12a4f069572')
      }
    },
    { '$group': { _id: { 'phase': '$phase' }, count: { $sum: 1 } } }]


  );
  // console.log('leadsByPhase :');
  // console.log(leadsByPhase);


  let tracking_phase = leadsModel.aggregate(
    [{
      '$match': {
        phase: { '$nin': ['discarded', 'finished'] },
        real_estate_group_id: mongoose.Types.ObjectId('5e9a2df024535649bdc51f54'),
        contact_broker_id: mongoose.Types.ObjectId('5db30d7c0a23f12a4f069572')
      }
    },
    { '$group': { _id: { 'phase': '$tracking_phase' }, count: { $sum: 1 } } }]



  );
  // console.log('tracking_phase :');
  // console.log(tracking_phase);

  // let data = {
  //   activeLeads: activeLeads,
  //   noTracking: noTracking,
  //   operationPhase: operationPhase,
  //   profile: profile,
  //   leadPostponed: leadPostponed,
  //   leadsByPhase: leadsByPhase,
  //   tracking_phase: tracking_phase,
  //   Date: new Date()
  // };

  // console.log('IMPRIMIENDO DATA');
  // console.log(data);

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

const acomodarData = arrData => {
    
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

module.exports.agregarData = agregarData;
module.exports.acomodarData = acomodarData;