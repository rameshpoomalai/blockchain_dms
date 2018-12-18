var apiUrl = location.protocol + '//' + location.host + "/api/";

//check user input and call server
$('.sign-in-member').click(function() {
  updateMember();
});


function updateMember() {

  //get user input data
  var formAccountNum = $('.account-number input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"accountnumber" : "' + formAccountNum + '", ' + '"cardid" : "' + formCardId + '"}';
  console.log(inputData)

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'memberData',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
      //display loading
      document.getElementById('loader').style.display = "block";
    },
    success: function(data) {

      //remove loader
      document.getElementById('loader').style.display = "none";

      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {

        //update heading
        $('.heading').html(function() {
          var str = '<h2><b>' + data.firstName + ' ' + data.lastName + '</b></h2>';
          str = str + '<h2><b>' + data.accountNumber + '</b></h2>';


          return str;
        });

        //update partners dropdown for earn points transaction
        $('.documentList').html(function() {
          var str = '<tr><th width="50%">Document Name </th><th width="50%">Document Status </th></tr>';
          var documentsData = data.documentsData;
          if(documentsData)
          {
            for (var i = 0; i < documentsData.length; i++) {

              str = str + '<tr><td width="50%">' + documentsData[i].docName + '</td><td width="50%"> ' + documentsData[i].docStatus + '</td></tr>';
            }
          }

          return str;
        });


        //update partners dropdown for use points transaction
        $('.approveRequestList').html(function() {
          var str = '<tr><th width="30%">Document Name</th><th width="30%">Requesting Partner</th><th width="30%">approve</th></tr>';
          var approveRequestList = data.approveRequestList;
          if(approveRequestList)
          {
            for (var i = 0; i < approveRequestList.length; i++) {

              if(approveRequestList[i].approvalStatus==true)
              {
                str = str + '<tr><td width="30%">' + approveRequestList[i].docName + '</td><td width="30%"> ' + approveRequestList[i].partner + '</td> <td width="30%"> Approved </td>  </tr>';
              }
              else {
                str = str + '<tr><td width="30%">' + approveRequestList[i].docName + '</td><td width="30%"> ' + approveRequestList[i].partner + '</td> <td width="30%"> <a><img  width="25" height="25" src="./img/approveicon.png"  onclick="return approveAcessRequest(\''+approveRequestList[i].requestId+'\');">Click to approve</img></a> </td>  </tr>';
              }
            }
          }

          return str;
        });


        //remove login section and display member page
        document.getElementById('loginSection').style.display = "none";
        document.getElementById('transactionSection').style.display = "block";
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {

    }
  });
}

$(document).ready(function() {

    $('#fileinfo').submit(function() {
       $(this).ajaxSubmit({
           error: function(xhr) {
             console.log('Error: ' + xhr.status);
           },
          success: function(response) {
               console.log(response);
           }
   });
       //Very important line, it disable the page refresh.
   return false;
   });
});

$('.add-documents').click(function() {

  addDocument();
});

function addDocument() {

  //get user input data
  var documentName = $('.document-name input').val();
  var documentDescription = $('.document-desc input').val();
  var documentContent = $('.document-content input').val();
  var formAccountNum = $('.account-number input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"accountnumber" : "' + formAccountNum + '", ' + '"cardid" : "'
  + formCardId  + '", "docName" : "' + documentName + '", "docDesc" : "' + documentDescription
  + '"}';
  console.log(inputData)

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'addDocument',
    data: inputData,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function() {
      //display loading
      document.getElementById('loader').style.display = "block";

    },
    success: function(data) {

      //remove loader


      //check data for error
      if (data.error) {
        alert(data.error);
        return;
      } else {



        //update partners dropdown for earn points transaction
        $('.documentList').html(function() {
          var str = '<tr><th width="50%">Document Name</th><th width="50%">Document Status</th></tr>';
          var documentsData = data.documentsData;
          if(documentsData)
          {
            for (var i = 0; i < documentsData.length; i++) {

              str = str + '<tr><td width="50%">' + documentsData[i].docName + '</td><td width="50%"> ' + documentsData[i].docStatus + '</td></tr>';
            }
          }

          return str;
        });


        //remove login section and display member page
        document.getElementById('loginSection').style.display = "none";
        document.getElementById('transactionSection').style.display = "block";
        $('.document-name input').val("");
        $('.document-desc input').val("");

      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);
    },
    complete: function() {
      document.getElementById('loader').style.display = "none";

    }
  });
}
function approveAcessRequest(requestId)
{

    //get user input data
    var formAccountNum = $('.account-number input').val();
    var formCardId = $('.card-id input').val();

    //create json data
    var inputData = '{' + '"accountNo" : "' + formAccountNum + '", ' + '"cardid" : "' + formCardId + '", "accessRequestId" :"'+requestId+'"}';
    console.log(inputData);

    //make ajax call
    $.ajax({
      type: 'POST',
      url: apiUrl + 'approveAccessRequest',
      data: inputData,
      dataType: 'json',
      contentType: 'application/json',
      beforeSend: function() {
        //display loading
        document.getElementById('loader').style.display = "block";
      },
      success: function(data) {

        //remove loader
        document.getElementById('loader').style.display = "none";

        //check data for error
        if (data.error) {
          alert(data.error);
          return;
        } else {

          //update heading
          //update partners dropdown for use points transaction
          $('.approveRequestList').html(function() {
            var str = '<tr><th width="30%">Document Name</th><th width="30%">Requesting Partner</th><th width="30%">approve</th></tr>';
            var approveRequestList = data.approveRequestList;
            if(approveRequestList)
            {
              for (var i = 0; i < approveRequestList.length; i++) {

                if(approveRequestList[i].approvalStatus==true)
                {
                str = str + '<tr><td width="30%">' + approveRequestList[i].docName + '</td><td width="30%"> ' + approveRequestList[i].partner + '</td> <td width="30%"> Approved </td>  </tr>';
                }
                else {
                  str = str + '<tr><td width="30%">' + approveRequestList[i].docName + '</td><td width="30%"> ' + approveRequestList[i].partner + '</td> <td width="30%"> <a><img  width="25" height="25" src="./img/approveicon.png"  onclick="return approveAcessRequest(\''+approveRequestList[i].requestId+'\');">Click to approve</img></a> </td>  </tr>';
                }

              }
            }

            return str;
          });

        }

      },
      error: function(jqXHR, textStatus, errorThrown) {
        //reload on error
        alert("Error: Try again")
        console.log(errorThrown);
        console.log(textStatus);
        console.log(jqXHR);
        document.getElementById('loader').style.display = "none";
        location.reload();
      }
    });
}
