const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');

//declate namespace
const namespace = 'org.ibm.dms';
const memberNS = 'resource:org.ibm.dms.Member#';
const partnerNS = 'resource:org.ibm.dms.Partner#';
const documentNS = 'resource:org.ibm.dms.Document#';
const regulatorNS = 'resource:org.ibm.dms.Regulator#';

//in-memory card store for testing so cards are not persisted to the file system
const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );

//admin connection to the blockchain, used to deploy the business network
let adminConnection;

//this is the business network connection the tests will use.
let businessNetworkConnection;

let businessNetworkName = 'dms-network';
let factory;


/*
 * Import card for an identity
 * @param {String} cardName The card name to use for this identity
 * @param {Object} identity The identity details
 */
async function importCardForIdentity(cardName, identity) {

  //use admin connection
  adminConnection = new AdminConnection();
  businessNetworkName = 'dms-network';

  //declare metadata
  const metadata = {
      userName: identity.userID,
      version: 1,
      enrollmentSecret: identity.userSecret,
      businessNetwork: businessNetworkName
  };

  //get connectionProfile from json, create Idcard
  const connectionProfile = require('./local_connection.json');
  //const connectionProfile = require('./connection-profile.json');

  const card = new IdCard(metadata, connectionProfile);

  //import card
  await adminConnection.importCard(cardName, card);
}


/*
* Reconnect using a different identity
* @param {String} cardName The identity to use
*/
async function useIdentity(cardName) {

  //disconnect existing connection
  await businessNetworkConnection.disconnect();

  //connect to network using cardName
  businessNetworkConnection = new BusinessNetworkConnection();
  await businessNetworkConnection.connect(cardName);
}


//export module
module.exports = {

  /*
  * Create Member participant and import card for identity
  * @param {String} cardId Import card id for member
  * @param {String} accountNumber Member account number as identifier on network
  * @param {String} firstName Member first name
  * @param {String} lastName Member last name
  * @param {String} phoneNumber Member phone number
  * @param {String} email Member email
  */
 registerMember: async function (cardId, accountNumber,firstName, lastName, email, phoneNumber) {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@dms-network');

      //get the factory for the business network
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create member participant
      const member = factory.newResource(namespace, 'Member', accountNumber);
      member.firstName = firstName;
      member.lastName = lastName;
      member.email = email;
      member.phoneNumber = phoneNumber;


      //add member participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Member');
      await participantRegistry.add(member);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Member#' + accountNumber, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@dms-network');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Create Partner participant and import card for identity
  * @param {String} cardId Import card id for partner
  * @param {String} partnerId Partner Id as identifier on network
  * @param {String} name Partner name
  */
  registerPartner: async function (cardId, partnerId, name) {

    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@dms-network');

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create partner participant
      const partner = factory.newResource(namespace, 'Partner', partnerId);
      partner.name = name;

      //add partner participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Partner');
      await participantRegistry.add(partner);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Partner#' + partnerId, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@dms-network');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },




  /*
  * Get Member data
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  */
  memberData: async function (cardId, accountNumber) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get member from the network
      const memberRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Member');
      const member = await memberRegistry.get(accountNumber);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return member object
      return member;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Get Partner data
  * @param {String} cardId Card id to connect to network
  * @param {String} partnerId Partner Id of partner
  */
  partnerData: async function (cardId, partnerId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get member from the network
      const partnerRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Partner');
      const partner = await partnerRegistry.get(partnerId);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return partner object
      return partner;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },


  /*
  * Create Partner participant and import card for identity
  * @param {String} cardId Import card id for partner
  * @param {String} partnerId Partner Id as identifier on network
  * @param {String} name Partner name
  */
  registerRegulator: async function (cardId, requlatorId, name) {

    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@dms-network');

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create partner participant
      const requlator = factory.newResource(namespace, 'Regulator', requlatorId);
      requlator.name = name;

      //add partner participant
      const requlatorRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Regulator');
      await requlatorRegistry.add(requlator);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Regulator#' + requlatorId, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@dms-network');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },
  /*
  * Get Partner data
  * @param {String} cardId Card id to connect to network
  * @param {String} partnerId Partner Id of partner
  */
  regulatorData: async function (cardId, regulatorId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get member from the network
      const regulatorRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Regulator');
      const regulator = await regulatorRegistry.get(regulatorId);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return partner object
      return regulator;
    }
    catch(err) {
      //print and return error
      console.log("regulatorData:"+err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  /*
  * Get all partners data
  * @param {String} cardId Card id to connect to network
  */
  allPartnersInfo : async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query all partners from the network
      const allPartners = await businessNetworkConnection.query('selectPartners');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return allPartners object
      return allPartners;
    }
    catch(err) {
      //print and return error
      console.log("allPartnersInfo:"+err);

      var error = {};
      error.error = err.message;
      return error
    }
  },

    /*
    * Get all partners data
    * @param {String} cardId Card id to connect to network
    */
    allMembersInfo : async function (cardId) {

      try {
        //connect to network with cardId
        businessNetworkConnection = new BusinessNetworkConnection();
        await businessNetworkConnection.connect(cardId);

        //query all partners from the network
        const allMembers = await businessNetworkConnection.query('selectMembers');

        //disconnect
        await businessNetworkConnection.disconnect(cardId);

        //return allPartners object
        return allMembers;
      }
      catch(err) {
        //print and return error
        console.log("selectMembers:"+err);

        var error = {};
        error.error = err.message;
        return error
      }
    },
  /*
  * Get all Regulators
  * @param {String} cardId Card id to connect to network
  */
  selectRegulators: async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query UsePoints transactions on the network
      const selectRegulators = await businessNetworkConnection.query('selectRegulators');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return selectRegulators;
    }
    catch(err) {
      //print and return error
      console.log("selectRegulators:"+err);
      var error = {};
      error.error = err.message;
      return error
    }

  },
  /*
  * Get all approved documents
  * @param {String} cardId Card id to connect to network
  */
  selectDocumentsApproved: async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);


      const selectDocumentsApproved = await businessNetworkConnection.query('selectDocumentsApproved');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return selectDocumentsApproved;
    }
    catch(err) {
      console.log("selectDocumentsApproved:"+err);
      var error = {};
      error.error = err.message;
      return error
    }

  },
  /*
  * Get all documents pending for approval
  * @param {String} cardId Card id to connect to network
  */
  selectDocumentsApprovalPending: async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);


      const selectDocumentsApprovalPending = await businessNetworkConnection.query('selectDocumentsApprovelPending');


      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return selectDocumentsApprovalPending;
    }
    catch(err) {

      console.log("selectDocumentsApprovalPending:"+err);
      var error = {};
      error.error = err.message;
      return error
    }

  },
  /*
  * Get a document
  * @param {String} cardId Card id to connect to network
  */
  getDocumentById: async function (cardId, documentId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);


      const document = await businessNetworkConnection.query('getDocument',{ documentId: documentNS+ documentId });

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return document;
    }
    catch(err) {
      //print and return error
      console.log("getDocumentById:"+err);
      var error = {};
      error.error = err.message;
      return error
    }

  },
  /*
  * Get all document by given owner
  * @param {String} cardId Card id to connect to network
  */
  selectDocumentByMember: async function (cardId,accountNumber) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);


      //query UsePoints transactions on the network
      //	WHERE (owner == _$owner)
      console.log("selectDocumentByMember"+memberNS +accountNumber)
      const document = await businessNetworkConnection.query('selectDocumentByMember',{ owner: memberNS +accountNumber });

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return document;
    }
    catch(err) {
      //print and return error

      console.log("selectDocumentByMember:"+err);
      var error = {};
      error.error = err.message;
      return error
    }

  },


/*
* Get all document by given owner
* @param {String} cardId Card id to connect to network
*/
selectApprovedDocumentByMember: async function (cardId,accountNumber) {

  try {
    //connect to network with cardId
    businessNetworkConnection = new BusinessNetworkConnection();
    await businessNetworkConnection.connect(cardId);


    //query UsePoints transactions on the network
    //	WHERE (owner == _$owner)
    console.log("selectDocumentByMember"+memberNS +accountNumber)
    const document = await businessNetworkConnection.query('selectApprovedDocumentByMember',{ owner: memberNS +accountNumber });

    //disconnect
    await businessNetworkConnection.disconnect(cardId);

    //return usePointsResults object
    return document;
  }
  catch(err) {
    //print and return error

    console.log("selectDocumentByMember:"+err);
    var error = {};
    error.error = err.message;
    return error
  }

},
  /*
  * Get all document by given owner
  * @param {String} cardId Card id to connect to network
  */
  documentList: async function (cardId,accountNumber) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);


      //query UsePoints transactions on the network
      //	WHERE (owner == _$owner)
      const document = await businessNetworkConnection.query('selectDocumentByMember',{ owner: memberNS+accountNumber });

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return document;
    }
    catch(err) {
      //print and return error
      console.log("Error getting documentList: "+err);
      var error = {};
      error.error = err.message;
      return error
    }

  },
  addDocument: async function (cardId, accountNumber, docName, docDesc, documentId, docPath)
  {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@dms-network');

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create partner participant
      const document = factory.newResource(namespace, 'Document', documentId);
      document.documentId = documentId
      document.docName = docName;
      document.documentPath = docPath;
      document.documentDescription = docDesc;
      document.docStatus = false;
      document.owner = factory.newRelationship(namespace, 'Member', accountNumber);

      //add partner participant
      const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Document');
      await assetRegistry.add(document);


          //disconnect
      await businessNetworkConnection.disconnect('admin@dms-network');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }


  },
  approveDocument: async function (cardId, documentId)
  {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@dms-network');

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //add partner participant
      const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.Document');
      var myDocument = await assetRegistry.get(documentId);
      myDocument.docStatus=true;
      await assetRegistry.update(myDocument);

          //disconnect
      await businessNetworkConnection.disconnect('admin@dms-network');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }


  },
  /*
  * Get all document by given owner
  * @param {String} cardId Card id to connect to network
  */
  authorizeRequestListByPartner: async function (cardId,accountNumber) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);



      //query UsePoints transactions on the network
      const document = await businessNetworkConnection.query('selectAllAuthorizeRequestByPartner',{ partner:  partnerNS+accountNumber  });

      //const document = await businessNetworkConnection.query('selectAuthorizeRequest');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return document;
    }
    catch(err) {
      //print and return error
      console.log("Error getting authorizeRequestList: "+err);
      var error = {};
      error.error = err.message;
      return error
    }




  },
  /*
  * Get all document by given owner
  * @param {String} cardId Card id to connect to network
  */
  authorizeRequestListByMember: async function (cardId,accountNumber) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);




      const document = await businessNetworkConnection.query('selectAllAuthorizeRequestByMember',{ member:  memberNS+accountNumber  });

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return document;
    }
    catch(err) {
      //print and return error
      console.log("Error getting authorizeRequestList: "+err);
      var error = {};
      error.error = err.message;
      return error
    }




  },

/*
* Get all document by given owner
* @param {String} cardId Card id to connect to network
*/
selectDocuments: async function (cardId) {

  try {
    //connect to network with cardId
    businessNetworkConnection = new BusinessNetworkConnection();
    await businessNetworkConnection.connect(cardId);


    //query UsePoints transactions on the network
    const document = await businessNetworkConnection.query('selectDocuments');

    //disconnect
    await businessNetworkConnection.disconnect(cardId);

    //return usePointsResults object
    return document;
  }
  catch(err) {
    //print and return error
    console.log("Error getting approveRequestList: "+err);
    var error = {};
    error.error = err.message;
    return error
  }

},



addAccessRequest: async function (cardId, partnerAccNo, docId, memberAccNo,  docName, requestId)
{
  try {

    //connect as admin
    businessNetworkConnection = new BusinessNetworkConnection();
    await businessNetworkConnection.connect('admin@dms-network');

    //get the factory for the business network.
    factory = businessNetworkConnection.getBusinessNetwork().getFactory();

    //create partner participant
    const authorizeRequest = factory.newResource(namespace, 'AuthorizeRequest', requestId);
    authorizeRequest.requestId = requestId
    authorizeRequest.documentId = docId
    authorizeRequest.docName = docName;
    authorizeRequest.approvalStatus = false;
    authorizeRequest.member = factory.newRelationship(namespace, 'Member', memberAccNo);
    authorizeRequest.partner = factory.newRelationship(namespace, 'Partner', partnerAccNo);
    //add partner participant
    const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.AuthorizeRequest');
    await assetRegistry.add(authorizeRequest);


        //disconnect
    await businessNetworkConnection.disconnect('admin@dms-network');

    return true;
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error;
  }


},
approveAccessRequest: async function (cardId, memberAccNo, accessRequestId)
{
  try {

    //connect as admin
    businessNetworkConnection = new BusinessNetworkConnection();
    await businessNetworkConnection.connect('admin@dms-network');

    const assetRegistry = await businessNetworkConnection.getAssetRegistry(namespace + '.AuthorizeRequest');
    authorizeRequest = await assetRegistry.get(accessRequestId);
    authorizeRequest.approvalStatus = true;

    await assetRegistry.update(authorizeRequest);


        //disconnect
    await businessNetworkConnection.disconnect('admin@dms-network');

    return true;
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error;
  }
}
}
