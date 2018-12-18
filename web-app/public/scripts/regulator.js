var apiUrl = location.protocol + '//' + location.host + "/api/";

//check user input and call server
$('.sign-in-regulator').click(function() {

  //get user input data
  var formregulatorId = $('.regulator-id input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"regulatorid" : "' + formregulatorId + '", ' + '"cardid" : "' + formCardId + '"}';
  console.log(inputData);

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'regulatorData',
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

        //update dashboard
        $('.dashboards').html(function() {

            var str = '<table width="100%"  class="blueTable  documentList" border="1" cellspacing="1" cellpadding="4"><tr><th>Member</th><th width="50%">Document Name </th><th width="50%">Document Status </th></tr>';
            var documentsData = data.approvedDocs;
            if(documentsData)
            {
              for (var i = 0; i < documentsData.length; i++) {

                str = str + '<tr><td width="50%">' + documentsData[i].owner + '</td><td width="50%">' + documentsData[i].docName + '</td><td width="50%"> ' + documentsData[i].docStatus + '</td></tr>';
              }
            }

            str = str + '</table>'
            return str;
        });

        //update dashboard
        $('.reviewandapprove').html(function() {
            var str = '<table width="100%"  class="blueTable  documentList" border="1" cellspacing="1" cellpadding="4"><tr><th>Member</th> <th>Document Name </th> <td>Approve </th></tr>';
            var documentsData = data.approvalPendingList;
            if(documentsData)
            {
              for (var i = 0; i < documentsData.length; i++) {

                str = str + '<tr><td >' + documentsData[i].owner + '</td><td > <a href="/api/viewDocument?path='+documentsData[i].documentPath+'">' + documentsData[i].docName +'</a></td><td> <img  width="25" height="25" src="./img/approveicon.png"  onclick="return approveDocument(\''+documentsData[i].documentId+'\');">Click to approve</img>  </td></tr>';
              }
            }

            str = str + '</table>'
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
      document.getElementById('loader').style.display = "none";
      location.reload();
    }
  });

});

function approveDocument(documentId) {

  //get user input data
  var formregulatorId = $('.regulator-id input').val();
  var formCardId = $('.card-id input').val();

  //create json data
  var inputData = '{' + '"regulatorid" : "' + formregulatorId + '", ' + '"cardid" : "' + formCardId + '", "documentId" :"'+documentId+'"}';
  console.log(inputData);

  //make ajax call
  $.ajax({
    type: 'POST',
    url: apiUrl + 'approveDocument',
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

        $('.dashboards').html(function() {

            var str = '<table width="100%"  class="blueTable  documentList" border="1" cellspacing="1" cellpadding="1"><tr><th>Member</th><th width="50%">Document Name </th><th width="50%">Document Status </th></tr>';
            var documentsData = data.approvedDocs;
            if(documentsData)
            {
              for (var i = 0; i < documentsData.length; i++) {

                str = str + '<tr><td width="50%">' + documentsData[i].owner + '</td><td width="50%">' + documentsData[i].docName + '</td><td width="50%"> ' + documentsData[i].docStatus + '</td></tr>';
              }
            }

            str = str + '</table>'
            return str;
        });

        //update dashboard
        $('.reviewandapprove').html(function() {
            var str = '<table width="100%"  class="blueTable documentList" border="1" cellspacing="1" cellpadding="1"><tr><th>Member</th> <th>Document Name </th> <td>Approve </td></tr>';
            var documentsData = data.approvalPendingList;
            if(documentsData)
            {
              for (var i = 0; i < documentsData.length; i++) {

                str = str + '<tr><td >' + documentsData[i].owner + '</td><td > <a href="/api/viewDocument?path='+documentsData[i].documentPath+'">' + documentsData[i].docName +'</a></td><td> <a href="/api/approveDocument?id='+documentsData[i].documentId+'">'+documentsData[i].documentId+'</a>  </td></tr>';
              }
            }

            str = str + '</table>'
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
