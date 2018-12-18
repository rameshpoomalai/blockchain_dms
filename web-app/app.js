'use strict';

//get libraries
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path')
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const multer   = require('multer');
const uuidv1 = require('uuid/v1');


//create express web-app
const app = express();
const router = express.Router();

//get the libraries to call
var network = require('./network/network.js');
var validate = require('./network/validate.js');
var analysis = require('./network/analysis.js');

const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

//bootstrap application settings
app.use(express.static('./public'));
app.use('/scripts', express.static(path.join(__dirname, '/public/scripts')));
app.disable('x-powered-by');
app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(helmet());
// using a single line of code will attach 7 protecting middleware to Express
// appapp.use(helmet());
// additional configurations can be applied on demand, this one mislead the
// caller to think we’re using PHP
app.use(helmet.hidePoweredBy({
  setTo: 'PHP 4.2.0'
}));


// const ipfsApi = require('ipfs-api');
// const ipfs = new ipfsApi('localhost', '5001', { protocol:'http' });

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })



app.post('/api/upload', upload.single('mydocument'), function(req, res) {
  // ipfs.add(files, function(err,resd)  {
  //   console.log("Step 4");
  //   if (err) {
  //
  //     res.json({
  //        error: 'Failed to upload new image'
  //      });
  //   } else {
  //     console.log("Step 5");
  //     let accountNumber = req.body.containerId
  //     let documentPath = `https://ipfs.io/ipfs/${resd[0].hash}`;
  //      res.json({
  //         success: response
  //       });
  //     }
  //   } );
		addDocument(req, res);
});

  // upload(req,res,function(err) {
  //   if(err) {
  //       return res.end("Error uploading file.");
  //   }
  //   res.end("File is uploaded");
  // });



    // Everything went fine.


//get home page
app.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

//get member page
app.get('/member', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/member.html'));
});

//get member registration page
app.get('/registerMember', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/registerMember.html'));
});

//get partner page
app.get('/partner', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/partner.html'));
});

//get partner registration page
app.get('/registerPartner', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/registerPartner.html'));
});

//get partner page
app.get('/regulator', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/regulator.html'));
});

//get partner registration page
app.get('/registerRegulator', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/registerRegulator.html'));
});

//get about page
app.get('/about', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/about.html'));
});

function addDocument(req, res)
{
  //declare variables to retrieve from request
  var accountNumber = req.body.accountnumber;
  var cardId = req.body.cardid;
  var docName = req.body.docName;
  var docDesc = req.body.docDesc;
  var returnData = {};
  //print variables
  console.log('Using param - docName: ' + docName + ' docDesc: ' + docDesc + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

  //validate member registration fields
  validate.validateDocumentDetails(cardId, accountNumber, docName, docDesc)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {

        //else register member on the network
        network.addDocument(cardId, accountNumber, docName, docDesc, uuidv1(),"https://ipfs.io/ipfs/")
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {

                //get UsePoints transactions from the network
                console.log('documentList using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);
                //network.documentList(cardId, accountNumber )

                network.selectDocumentByMember(cardId,accountNumber)
                  .then((documentsData) => {
                    //return error if error in response
                    console.log("documentsData:"+documentsData);
                    if (documentsData.error != null) {
                      res.json({
                        error: documentsData.error
                      });
                      return;
                    } else {
                      //else add transaction data to return object
                      returnData.documentsData = documentsData;
                    }
                    res.json(returnData);

                  })

            }
          });
      }
    });
}

//post call to register member on the network
app.post('/api/addDocument', function(req, res) {
  addDocument(req, res);
});

//post call to register member on the network
app.post('/api/approveDocument', function(req, res) {

  //declare variables to retrieve from request
  var accountNumber = req.body.regulatorid;
  var cardId = req.body.cardid;
  var docId = req.body.documentId;
  var returnData = {};
  //print variables
  console.log('approveDocument Using param - docId: ' + docId );

  //validate member registration fields
  validate.validateDocumentId(cardId, accountNumber, docId)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {

        //else register member on the network
        network.approveDocument(cardId, docId)
        .then(() => {
          //get UsePoints transactions from the network

            network.selectDocumentsApproved(cardId)
              .then((approvedDocs) => {
                console.log("selectDocumentsApproved>>>>>>"+approvedDocs)
                //return error if error in response
                if (approvedDocs.error != null) {
                  res.json({
                    error: approvedDocs.error
                  });
                } else {
                  //else add transaction data to return object
                  returnData.approvedDocs = approvedDocs;
                  //add total points given by partner to return object

                }
              });

        })
        .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {

                //get UsePoints transactions from the network
                console.log('documentList using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);
                //network.documentList(cardId, accountNumber )
                //Load the approval pending list
                network.selectDocumentsApprovalPending(cardId)
                  .then((approvalPendingList) => {

                    //return error if error in response
                    if (approvalPendingList.error != null) {
                      res.json({
                        error: approvalPendingList.error
                      });
                    } else {
                      //else add transaction data to return object
                      returnData.approvalPendingList = approvalPendingList;
                      //add total points given by partner to return object

                    }

                    //return returnData
                    res.json(returnData);

                  });
            }
          });

      }
    });


});

//post call to register member on the network
app.post('/api/registerMember', function(req, res) {

  //declare variables to retrieve from request
  var accountNumber = req.body.accountnumber;
  var cardId = req.body.cardid;
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var phoneNumber = req.body.phonenumber;

  //print variables
  console.log('Using param - firstname: ' + firstName + ' lastname: ' + lastName + ' email: ' + email + ' phonenumber: ' + phoneNumber + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

  //validate member registration fields
  validate.validateMemberRegistration(cardId, accountNumber, firstName, lastName, email, phoneNumber)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register member on the network
        network.registerMember(cardId, accountNumber, firstName, lastName, email, phoneNumber)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              res.json({
                success: response
              });
            }
          });
      }
    });


});

//post call to register partner on the network
app.post('/api/registerPartner', function(req, res) {

  //declare variables to retrieve from request
  var name = req.body.name;
  var partnerId = req.body.partnerid;
  var cardId = req.body.cardid;

  //print variables
  console.log('Using param - name: ' + name + ' partnerId: ' + partnerId + ' cardId: ' + cardId);

  //validate partner registration fields
  validate.validatePartnerRegistration(cardId, partnerId, name)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register partner on the network
        network.registerPartner(cardId, partnerId, name)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              res.json({
                success: response
              });
            }
          });
      }
    });

});




//post call to retrieve member data, transactions data and partners to perform transactions with from the network
app.post('/api/memberData', function(req, res) {

  //declare variables to retrieve from request
  var accountNumber = req.body.accountnumber;
  var cardId = req.body.cardid;

  //print variables
  console.log('memberData using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get member data from network
  network.memberData(cardId, accountNumber)
    .then((member) => {
      //return error if error in response
      if (member.error != null) {
        res.json({
          error: member.error
        });
        return;
      } else {
        //else add member data to return object
        returnData.accountNumber = member.accountNumber;
        returnData.firstName = member.firstName;
        returnData.lastName = member.lastName;
        returnData.phoneNumber = member.phoneNumber;
        returnData.email = member.email;
        returnData.points = member.points;



      }

    })

    .then(() => {
      //get UsePoints transactions from the network
      console.log('documentList using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);
      network.documentList(cardId, accountNumber )
        .then((documentsData) => {
          //return error if error in response
          console.log("documentsData:"+documentsData);
          if (documentsData.error != null) {
            res.json({
              error: documentsData.error
            });
            return;
          } else {
            //else add transaction data to return object
            returnData.documentsData = documentsData;
          }

        })

    })
    .then(() => {
      //get EarnPoints transactions from the network
      console.log('authorizeRequestList using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);
      network.authorizeRequestListByMember(cardId, accountNumber)
        .then((authorizeRequestList) => {
          console.log("authorizeRequestList:"+authorizeRequestList);
          //return error if error in response
          if (authorizeRequestList.error != null) {
            res.json({
              error: authorizeRequestList.error
            });
            return;
          }
          else {
            //else return success
            returnData.approveRequestList = authorizeRequestList;
            res.json(returnData);
          }

        })

    });

});

//post call to retrieve partner data and transactions data from the network
app.post('/api/partnerData', function(req, res) {

  //declare variables to retrieve from request
  var partnerId = req.body.partnerid;
  var cardId = req.body.cardid;

  //print variables
  console.log('partnerData using param - ' + ' partnerId: ' + partnerId + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get partner data from network
  network.partnerData(cardId, partnerId)
    .then((partner) => {
      //return error if error in response
      if (partner.error != null) {
        res.json({
          error: partner.error
        });
      } else {
        //else add partner data to return object
        returnData.id = partner.id;
        returnData.name = partner.name;
      }
    })
    .then(() => {
      //get EarnPoints transactions from the network
      console.log('authorizeRequestList using param - ' + ' partnerId: ' + partnerId + ' cardId: ' + cardId);
      network.authorizeRequestListByPartner(cardId, partnerId)
        .then((requestedDocumentsApproved) => {
          console.log("requestedDocumentsPending:"+authorizeRequestList);
          //return error if error in response
          if (authorizeRequestList.error != null) {
            res.json({
              error: authorizeRequestList.error
            });
            return;
          }
          else {
            //else return success
            returnData.authorizeRequestList = authorizeRequestList;
            //res.json(returnData);
          }

        })

    })
    .then(() => {
      //get EarnPoints transactions from the network
      console.log('allMembers using param - ' + ' partnerId: ' + partnerId + ' cardId: ' + cardId);
      network.allMembersInfo(cardId)
        .then((allMembers) => {
          console.log("allMembers:"+allMembers);
          //return error if error in response
          if (allMembers.error != null) {
            res.json({
              error: allMembers.error
            });
            return;
          }
          else {
            //else return success
            returnData.allMembers = allMembers;
            res.json(returnData);
          }

        })

    })

});

//post call to retrieve partner data and transactions data from the network
app.post('/api/selectMembers', function(req, res) {

  //declare variables to retrieve from request
  var partnerId = req.body.partnerid;
  var cardId = req.body.cardid;

  //print variables
  console.log('partnerData using param - ' + ' partnerId: ' + partnerId + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get partner data from network
  network.selectMembers(cardId, partnerId)
    .then((member) => {
      //return error if error in response
      if (members.error != null) {
        res.json({
          error: members.error
        });
      } else {
        //else add partner data to return object
        returnData.members = members;

      }
      //return returnData
      res.json(returnData);
    });


});


app.post('/api/selectApprovedDocumentByMember', function(req, res) {

  //declare variables to retrieve from request
  var memberId = req.body.accountNo;
  var cardId = req.body.cardid;

  //print variables
  console.log('selectApprovedDocumentByMember using param - ' + ' memberId: ' + memberId + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get partner data from network
  //network.selectApprovedDocumentByMember(cardId, memberId) TODO
  network.selectDocumentByMember(cardId, memberId)

    .then((documents) => {
      //return error if error in response
      if (documents.error != null) {
        res.json({
          error: document.error
        });
      } else {
        //else add partner data to return object
        console.log("selectApprovedDocumentByMember:"+documents);
        returnData.documentsData = documents;
      }
      //return returnData
      res.json(returnData);
    });


});
//post call to retrieve partner data and transactions data from the network
app.post('/api/selectDocumentByMember', function(req, res) {

  //declare variables to retrieve from request
  var memberId = req.body.accountNo;
  var cardId = req.body.cardid;

  //print variables
  console.log('selectDocumentByMember using param - ' + ' memberId: ' + memberId + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get partner data from network
  network.selectDocumentByMember(cardId, memberId)
    .then((documents) => {
      //return error if error in response
      if (documents.error != null) {
        res.json({
          error: document.error
        });
      } else {
        //else add partner data to return object
        returnData.documentsData = documents;
      }
      //return returnData
      res.json(returnData);
    });


});
app.post('/api/registerRegulator', function(req, res) {

  //declare variables to retrieve from request
  var name = req.body.name;
  var regulatorId = req.body.regulatorid;
  var cardId = req.body.cardid;

  //print variables
  console.log('Using param - name: ' + name + ' regulatorId: ' + regulatorId + ' cardId: ' + cardId);

  //validate partner registration fields
  validate.validateRegulatorRegistration(cardId, regulatorId, name)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register partner on the network
        network.registerRegulator(cardId, regulatorId, name)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              res.json({
                success: response
              });
            }
          });
      }
    });

});

//post call to retrieve partner data and transactions data from the network
app.post('/api/regulatorData', function(req, res) {

  //declare variables to retrieve from request
  var regulatorId = req.body.regulatorid;
  var cardId = req.body.cardid;

  //print variables
  console.log('regulatorData using param - ' + ' regulatorId: ' + regulatorId + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get partner data from network
  network.regulatorData(cardId, regulatorId)
    .then((regulator) => {
      console.log("Getting the regulator Data"+regulator);
      //return error if error in response
      if (regulator.error != null) {
        res.json({
          error: regulator.error
        });
      } else {
        //else add partner data to return object
        returnData.id = regulator.id;
        returnData.name = regulator.name;
      }

    })
    .then(() => {
      //get UsePoints transactions from the network

        network.selectDocumentsApproved(cardId)
          .then((approvedDocs) => {
            console.log("selectDocumentsApproved>>>>>>"+approvedDocs)
            //return error if error in response
            if (approvedDocs.error != null) {
              res.json({
                error: approvedDocs.error
              });
            } else {
              //else add transaction data to return object
              returnData.approvedDocs = approvedDocs;
              //add total points given by partner to return object

            }
          });

    })
     .then(() => {
      //get UsePoints transactions from the network

        network.selectDocumentsApprovalPending(cardId)
          .then((approvalPendingList) => {

            //return error if error in response
            if (approvalPendingList.error != null) {
              res.json({
                error: approvalPendingList.error
              });
            } else {
              //else add transaction data to return object
              returnData.approvalPendingList = approvalPendingList;
              //add total points given by partner to return object

            }

            //return returnData
            res.json(returnData);

          });

    });

});


//post call to register member on the network
app.post('/api/requestAccess', function(req, res) {

  //declare variables to retrieve from request
  var partnerAccNumber = req.body.accountnumber;
  var cardId = req.body.cardid;
  var docId = req.body.documentId;
  var docName = req.body.docName;
  var memberAccNumber = req.body.member;
  var returnData = {};
  //print variables
  console.log('requestAccess Using param - docId: ' + docId );


  //validate member registration fields
  validate.validateAccessRequest(cardId, partnerAccNumber, docId, memberAccNumber)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {

        //else register member on the network
        network.addAccessRequest(cardId, partnerAccNumber, docId, memberAccNumber,docName, uuidv1() )
        .then(() => {
          //get UsePoints transactions from the network
            console.log("partnerAccNumber:"+partnerAccNumber)
            console.log("cardId:"+cardId)
            network.authorizeRequestListByPartner(cardId, partnerAccNumber)
              .then((authorizeRequestList) => {
                console.log("authorizeRequestList>>>>>>:"+authorizeRequestList)
                //return error if error in response
                if (authorizeRequestList.error != null) {
                  res.json({
                    error: authorizeRequestList.error
                  });
                } else {
                  //else add transaction data to return object
                  returnData.authorizeRequestList = authorizeRequestList;
                  //add total points given by partner to return object
                  res.json(returnData);
                }
              });
              res.json(returnData);
          });

    }

});
});



//post call to register member on the network
app.post('/api/approveAccessRequest', function(req, res) {

  //declare variables to retrieve from request
  var memberAccNo = req.body.accountNo;
  var cardId = req.body.cardid;
  var accessRequestId = req.body.accessRequestId;

  var returnData = {};
  //print variables
  console.log('approveAccessRequest Using param - accessRequestId: ' + accessRequestId );


  //validate member registration fields
  validate.validateAccessRequest(cardId, memberAccNo, accessRequestId)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {

        //else register member on the network
        network.approveAccessRequest(cardId, memberAccNo, accessRequestId)
        .then(() => {
          //get UsePoints transactions from the network
            console.log("partnerAccNumber:"+memberAccNo)
            console.log("cardId:"+cardId)
            network.authorizeRequestListByMember(cardId, memberAccNo)
              .then((authorizeRequestList) => {
                console.log("authorizeRequestList:"+authorizeRequestList);
                //return error if error in response
                if (authorizeRequestList.error != null) {
                  res.json({
                    error: authorizeRequestList.error
                  });
                  return;
                }
                else {
                  //else return success
                  returnData.approveRequestList = authorizeRequestList;
                  res.json(returnData);
                }

              })

          });

    }

  });
});
//declare port
var port = process.env.PORT || 8000;
if (process.env.VCAP_APPLICATION) {
  port = process.env.PORT;
}

//run app on port
app.listen(port, function() {
  console.log('app running on port: %d', port);
});
