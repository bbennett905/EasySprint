function intro() {
    //create P elements for everything
    //had to create a separate P element for each Textarea so it looks formatted correctly
    var planningDocName = document.createElement("h1");

    var para = document.createElement("h3");
    var paraSub = document.createElement("P");
    var paraSubmit = document.createElement("P");

    var para2 = document.createElement("h3");
    var paraSub2 = document.createElement("P");
    var paraSubmit2 = document.createElement("P");

    var para3 = document.createElement("h3");
    var paraSub3 = document.createElement("P");
    var paraSubmit3 = document.createElement("P");

    var para4 = document.createElement("h3");
    var paraSub4 = document.createElement("P");
    var paraSubmit4 = document.createElement("P");


    //create and set textarea elements for each element in the intro
    var sprintText = document.createElement("TEXTAREA");
    sprintText.setAttribute("type","text");
    sprintText.setAttribute("rows","5");
    sprintText.setAttribute("cols","100");
    sprintText.setAttribute("readonly","true");
    sprintText.setAttribute("ondblclick","this.readOnly='';");
    sprintText.setAttribute("id","sprintText");

    var scrumMaster = document.createElement("INPUT");
    scrumMaster.setAttribute("type","text");
    scrumMaster.setAttribute("readonly","true");
    scrumMaster.setAttribute("ondblclick","this.readOnly='';");
    scrumMaster.setAttribute("id","scrumMaster");

    var planText = document.createElement("TEXTAREA");
    planText.setAttribute("type","text");
    planText.setAttribute("rows","5");
    planText.setAttribute("cols","100");
    planText.setAttribute("readonly","true");
    planText.setAttribute("ondblclick","this.readOnly='';");
    planText.setAttribute("id","planText");

    var risksText = document.createElement("TEXTAREA");
    risksText.setAttribute("type","text");
    risksText.setAttribute("rows","5");
    risksText.setAttribute("cols","100");
    risksText.setAttribute("readonly","true");
    risksText.setAttribute("ondblclick","this.readOnly='';");
    risksText.setAttribute("id","risksText");



    var sO ="Sprint Overview: ";
    var sM ="Scrum Master: ";
    var wMP ="Weekly Meeting Plan: ";
    var risks = "Risks and Challenges: ";

    var placeHolderNode = document.createTextNode("[Insert Sprint Planning Doc Name here]");
    planningDocName.appendChild(placeHolderNode);

    var t = document.createTextNode(sO);
    para.appendChild(t);
    paraSub.appendChild(sprintText);

    var t1 = document.createTextNode(sM);
    para2.appendChild(t1);
    paraSub2.appendChild(scrumMaster);

    var t2 = document.createTextNode(wMP);
    para3.appendChild(t2);
    paraSub3.appendChild(planText);

    var t3 = document.createTextNode(risks);
    para4.appendChild(t3);
    paraSub4.appendChild(risksText);

    document.getElementById("myDIV").appendChild(planningDocName);

    document.getElementById("myDIV").appendChild(para);
    document.getElementById("myDIV").appendChild(paraSub);
    document.getElementById("myDIV").appendChild(paraSubmit);


    document.getElementById("myDIV").appendChild(para2);
    document.getElementById("myDIV").appendChild(paraSub2);
    document.getElementById("myDIV").appendChild(paraSubmit2);


    document.getElementById("myDIV").appendChild(para3);
    document.getElementById("myDIV").appendChild(paraSub3);
    document.getElementById("myDIV").appendChild(paraSubmit3);


    document.getElementById("myDIV").appendChild(para4);
    document.getElementById("myDIV").appendChild(paraSub4);
    document.getElementById("myDIV").appendChild(paraSubmit4);



}

window.addEventListener('load', function() {
    document.getElementById('sign-out').addEventListener('click', function() {
        firebase.auth().signOut();
    });
    document.getElementById('test-buttona').addEventListener('click', function() {
        db.ref('newDocs/' + firebase.auth().currentUser.uid).set(true);
    });
    document.getElementById('test-buttonb').addEventListener('click', function() {
        db.ref('docs/1/users/fakeuid').set(true);
    });

    var numRows = 1;
    function getNumRows() {
        return numRows;

    }
    document.getElementById('add_row').addEventListener('click', function() {
        var table = document.getElementById('people-table');
        var row = table.insertRow(table.rows.length);
        var inputRow = table.rows[1];

        row.insertCell(0).innerHTML = document.getElementById('people-table-input-task').value;
        row.insertCell(1).innerHTML = document.getElementById('people-table-input-name').value;
        row.insertCell(2).innerHTML = document.getElementById('people-table-input-mail').value;
        row.insertCell(3).innerHTML = document.getElementById('people-table-input-phone').value;

        /*document.getElementById('addr' + numRows).innerHtml = "<td>" + (numRows + 1) +
            "</td><td><input name='name" + numRows +
            "' type='text' placeholder='Name' class='form-control input-md'  /> </td><td><input  name='mail" +
            numRows + "' type='text' placeholder='Mail'  class='form-control input-md'></td><td><input  name='mobile" +
            numRows + "' type='text' placeholder='Mobile'  class='form-control input-md'></td>";
        console.log(document.getElementById('tab_logic').innerHTML);
        document.getElementById('tab_logic').innerHTML += '<tr id="addr'+(numRows+1)+'"></tr>';
        console.log(document.getElementById('tab_logic').innerHTML);*/
        numRows++;
    });
    document.getElementById('delete_row').addEventListener('click', function() {
        if (numRows > 1) {
            var table = document.getElementById('people-table');
            table.deleteRow(table.rows.length - 1);
            numRows--;
        } else {
            //should give a warning or something here
        }
    });
    document.getElementById('sprintText').addEventListener('input',function () {
       var sprintText  = document.getElementById('sprintText').valueOf();
       console.log(sprintText);

    });


});

//JQUERY attempt to try and get the text as soon as it is input
$('#sprintText').bind('input', function() {
    // var x  = $(this).val(); // get the current value of the input field.
    $(this).next().stop(true, true).fadeIn(0).html('[input event fired!]: ' + $(this).val()).fadeOut(2000);
});
$('#scrumMaster').on('input', function() {
    $(this).val() // get the current value of the input field.
});
$('#planText').on('input', function() {
    $(this).val() // get the current value of the input field.
});
$('#risksText').on('input', function() {
    $(this).val() // get the current value of the input field.
});
$('#modern').bind('input', function() {
    $(this).next().stop(true, true).fadeIn(0).html('[input event fired!]: ' + $(this).val()).fadeOut(2000);
});
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}