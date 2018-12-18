var apiUrl = location.protocol + '//' + location.host + "/api/";

//check user input and call server
$('.sign-in-partner').click(function() {

  //get user input data
  var formPartnerId = $('.partner-id input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"partnerid" : "' + formPartnerId + '", ' + '"cardid" : "' + formCardId + '"}';
  console.log(inputData);

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'partnerData',
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
          var str = '<h2><b> ' + data.name + ' </b></h2>';
          str = str + '<h2><b> ' + data.id + ' </b></h2>';

          return str;
        });


        $('.documentApprovedList').html(function() {

            var str = '<table  width="100%"  class="blueTable documentList" border="1" cellspacing="1" cellpadding="4"><tr><th>Member</th><th width="50%">Document Name </th><th width="50%">Document Status </th></tr>';
            var documentsData = data.authorizeRequestList;
            if(documentsData)
            {
              for (var i = 0; i < documentsData.length; i++) {

                if(documentsData[i].approvalStatus==true)
                {
                    str = str + '<tr><td width="50%">' + documentsData[i].member + '</td><td width="50%">' + documentsData[i].docName + '</td><td width="50%"> ' + documentsData[i].approvalStatus + '</td></tr>';
                }

              }
            }

            str = str + '</table>'
            return str;
        });

        //update dashboard
        $('.documentPendingList').html(function() {

            var str = '<table width="100%"  class="blueTable documentList" border="1" cellspacing="1" cellpadding="4"><tr><th>Member</th><th width="50%">Document Name </th><th width="50%">Document Status </th></tr>';
            var documentsData = data.authorizeRequestList;
            if(documentsData)
            {
              for (var i = 0; i < documentsData.length; i++) {

                if(documentsData[i].approvalStatus==false)
                {
                    str = str + '<tr><td width="50%">' + documentsData[i].member + '</td><td width="50%">' + documentsData[i].docName + '</td><td width="50%"> ' + documentsData[i].approvalStatus + '</td></tr>';
                }
              }
            }

            str = str + '</table>'
            return str;
        });
        //update dashboard
        $('.selectMember').html(function() {
            var str = '';
            var documentsData = data.allMembers;
            if(documentsData)
            {
              str = str + '<option values="0">--------------Select---------------</option>';
              for (var i = 0; i < documentsData.length; i++) {
                str = str + '<option value="' + documentsData[i].accountNumber + '">' + documentsData[i].firstName +' '+ documentsData[i].lastName+'</option>';
              }
            }
            return str;

        });

        //remove login section
        document.getElementById('loginSection').style.display = "none";
        //display transaction section
        document.getElementById('transactionSection').style.display = "block";
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);

      location.reload();
    }
  });

});
$('select.selectMember').change( function() {

  //get user input data
  var formPartnerId = $('.partner-id input').val();
  var formCardId = $('.card-id input').val();
  var memberAccountNo = $(this).children("option:selected").val();
  if(memberAccountNo=="0")
  {
    return
  }

  //create json data
  var inputData = '{' + '"partnerid" : "' + formPartnerId + '", ' + '"cardid" : "' + formCardId + '","accountNo": "'+memberAccountNo+'"}';
  console.log(inputData);

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'selectApprovedDocumentByMember',
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

        //update dashboard
        $('.selectDocument').html(function() {
            var str = '<option values="0">--------------Select---------------</option>';
            var documentsData = data.documentsData;
            if(documentsData)
            {
              for (var i = 0; i < documentsData.length; i++) {

                str = str + '<option values="' + documentsData[i].documentId + '">' + documentsData[i].docName +'</option>';
              }
            }
            return str;

        });

        //remove login section
        document.getElementById('loginSection').style.display = "none";
        //display transaction section
        document.getElementById('transactionSection').style.display = "block";
      }

    },
    error: function(jqXHR, textStatus, errorThrown) {
      //reload on error
      alert("Error: Try again")
      console.log(errorThrown);
      console.log(textStatus);
      console.log(jqXHR);

      location.reload();
    }
  });
});


$('.add-document-access-request-asset').click(function() {
  requestAccess();
});

function requestAccess() {

  //get user input data/

  var memberAccountNo = $('.selectMember').children("option:selected").val();
  var documentId = $('.selectDocument').children("option:selected").val();
  var formAccountNum = $('.partner-id input').val();
  var formCardId = $('.card-id input').val();
  var docName = $('.selectDocument').val();

  if(documentId)
  {
    //placeholder for validation check
    if((documentId =="--------------Select---------------") )
    {
      alert("Select valid document!!!!!!!!!!!!");
      return
    }
  }
  else {
    alert("Select valid document!!!!!!");
    return
  }

  if(memberAccountNo)
  {
    //placeholder for validation check
    if((memberAccountNo =="--------------Select---------------") )
    {
      alert("Select valid member!!!!!!!!!!!!");
      return
    }
  }
  else {
    alert("Select valid member!!!!!!");
    return
  }


  //create json data
  var inputData = '{' + '"accountnumber" : "' + formAccountNum + '", "cardid" : "'
  + formCardId  + '", "member" : "'  + memberAccountNo  + '", "docName" : "'  + docName
  + '", "documentId" : "' + documentId +  '"}';
  console.log(inputData)

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'requestAccess',
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


        //update dashboard
        $('.documentApprovedList').html(function() {

            var str = '<table width="100%"  class="blueTable documentList" border="1" cellspacing="1" cellpadding="4"><tr><th>Member</th><th width="50%">Document Name </th><th width="50%">Document Status </th></tr>';
            var documentsData = data.authorizeRequestList;
            if(documentsData)
            {
              for (var i = 0; i < documentsData.length; i++) {

                if(documentsData[i].approvalStatus==true)
                {
                    str = str + '<tr><td width="50%">' + documentsData[i].member + '</td><td width="50%">' + documentsData[i].docName + '</td><td width="50%"> ' + documentsData[i].approvalStatus + '</td></tr>';
                }

              }
            }

            str = str + '</table>'
            return str;
        });

        //update dashboard
        $('.documentPendingList').html(function() {

            var str = '<table width="100%"  class="blueTable documentList" border="1" cellspacing="1" cellpadding="4"><tr><th>Member</th><th width="50%">Document Name </th><th width="50%">Document Status </th></tr>';
            var documentsData = data.authorizeRequestList;
            if(documentsData)
            {
              for (var i = 0; i < documentsData.length; i++) {

                if(documentsData[i].approvalStatus==false)
                {
                    str = str + '<tr><td width="50%">' + documentsData[i].member + '</td><td width="50%">' + documentsData[i].docName + '</td><td width="50%"> ' + documentsData[i].approvalStatus + '</td></tr>';
                }
              }
            }

            str = str + '</table>'
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
      $('.selectMember').val("");
      $('.selectDocument').val("");

    }
  });
}
