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
function scrumMaster() {
    /*
    var docid = parseInt(window.location.hash.substring(1));
    var users =[];
    firebase.database.ref('docs/' + docid + '/people').once('value', function(snapshot) {
        snapshot.forEach(function(innerSnap) {
            //I think innerSnap.key is the index/id
            users.push(innerSnap.child('name').val());
            //should be the name, same for email and phone
        });
    });
    */
    //test array
    var users =["Carl Weathers","Apollo Creed", "Rocky" ,"Ivan Drago"];
    for(var i = 0; i < users.length ; i++) {
        //create input element for radio button
        var user = document.createElement("INPUT");
        user.setAttribute("type", "radio");
        user.setAttribute("id", users[i]);
        user.setAttribute("name", "master");
        document.getElementById("scrumMaster").appendChild(user);
        /*creating label for Text to Radio button*/
        var lblYes = document.createElement("LABEL");
        /*create text node for label Text which display for Radio button*/
        var textYes = document.createTextNode(users[i]);
        lblYes.appendChild(textYes);
        document.getElementById("scrumMaster").appendChild(lblYes);
        //create new span for each user
        var space = document.createElement("span");
        space.setAttribute("innerHTML", "&nbsp;&nbsp");
        //make a space for each new radio button
        document.getElementById("scrumMaster").appendChild(space);
        var spaceBr= document.createElement("br");
        document.getElementById("scrumMaster").appendChild(spaceBr);

    }
}
function checkScrumMaster() {
    var users =["Carl Weathers","Apollo Creed", "Rocky" ,"Ivan Drago"];
    var scrumMaster ="none Selected";
    for (var i = 0; i < users.length; i++) {
        if (document.getElementById(users[i]).checked) {
            scrumMaster = users[i];
        }
    }


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

function generateTaskRow() {
    //TODO insert stuff to add to database

    var userStory=document.getElementById("userStory");
    var new_row = userStory.rows[1].cloneNode(true);
    var len = userStory.rows.length;
    new_row.cells[0].innerHTML = len;
    new_row.className ="danger";
    //new_row.classList ="danger";
    var inp1 = new_row.cells[1].getElementsByTagName("textarea")[0];
    inp1.id += len;
    inp1.value = '';
    var inp2 = new_row.cells[2].getElementsByTagName("input")[0];
    inp2.value = "";
    //var inp2 = new_row.cells[3].getElementsByTagName("td")[0];
    userStory.appendChild(new_row);

}
function deleteStoryFromUserStory(row)
{
    //TODO insert stuff to delete from database
    var i=row.parentNode.parentNode.rowIndex;
    if(i == 1){
        alert("Can't have Zero Tasks in User Story");
    } else {
        document.getElementById("userStory").deleteRow(i);
    }
}
function generateBacklogRow() {
    //TODO figure out how to get the class name set
    //TODO figure out how to generate a row on its own
    //TODO insert stuff to add to database

    //currently only works as long as the second element isn't deleted
        var backlogTable=document.getElementById("backlogTable");
        var new_row = backlogTable.rows[3].cloneNode(true);
        var len = backlogTable.rows.length;
        new_row.cells[0].innerHTML = len;
        new_row.className ="danger";
        //new_row.classList ="danger";
            var inp1 = new_row.cells[1].getElementsByTagName("textarea")[0];
        inp1.id += len;
        inp1.value = '';
        var inp2 = new_row.cells[3].getElementsByTagName("td")[0];
        backlogTable.appendChild(new_row);
    /*
    var tableID = document.getElementById("backlogTable");
    var table = document.getElementById(tableID);

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    var cell3 = row.insertCell(0);
    cell3.innerHTML = cell3.innerHTML +' <input type="text" size="20" name="values[]"/> <INPUT type="button"  class="btn_medium" value="Remove" onclick="this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);" /><br><small><font color="gray">Enter Title</font></small>';

*/

}
function generateBacklog() {

}
function deleteStoryFromBacklog(row)
{
    //TODO insert stuff to delete from database

    var i=row.parentNode.parentNode.rowIndex;
    if(i == 1){
        alert("Can't have Zero User Stories in Backlog");
    } else {
        document.getElementById("backlogTable").deleteRow(i);
    }
}

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
function addTable() {
    var myTableDiv = document.getElementById("metric_results");
    var table = document.createElement('TABLE');
    var tableBody = document.createElement('TBODY');
    table.className ="table";

    table.border = '1';
    table.appendChild(tableBody);

    var heading = new Array();
    heading[0] = "Task #";
    heading[1] = "Hours";
    heading[2] = "Assigned to";
    heading[3] = "Status";
    heading[4] = "Options";

    var stock = new Array()
    stock[0] = new Array("Cars", "88.625", "85.50", "85.81", "987");
    stock[1] = new Array("Veggies", "88.625", "85.50", "85.81", "988");
    stock[2] = new Array("Colors", "88.625", "85.50", "85.81", "989");
    stock[3] = new Array("Numbers", "88.625", "85.50", "85.81", "990");
    stock[4] = new Array("Requests", "88.625", "85.50", "85.81", "991");

    //TABLE COLUMNS
    var tr = document.createElement('TR');
    tableBody.appendChild(tr);
    for (i = 0; i < heading.length; i++) {;
        var th = document.createElement('TH')
        th.width = '75';
        th.appendChild(document.createTextNode(heading[i]));
        tr.appendChild(th);
    }

    //TABLE ROWS
    for (i = 0; i < stock.length; i++) {
        var tr = document.createElement('TR');

        for (j = 1; j < stock[i].length; j++) {
            var td = document.createElement('TD')
            td.appendChild(document.createTextNode(stock[i][j]));
            tr.appendChild(td)
        }
        tableBody.appendChild(tr);
    }
    myTableDiv.appendChild(table)
}