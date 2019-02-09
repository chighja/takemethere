function showLoader() {
  $('#loader').show();
}

function hideLoader() {
  $('#loader').hide();
}

// gets location and comment data from travelDb
function getData() {
  // MODEL-VIEW-CONTROL MVC PATTERN
  $.get('/locations')
    .then(function(data) {
      // data MODEL
      return data;
    })
    .then(function(data1) {
      // CONTROL data
      $.get('/locations/comment').then(function(data2) {
        // synchronized state
        maker(data1, data2); // render VIEW
        return true;
      });
    })
    .catch(function(err) {
      alert(err);
    });
}

// puts each comment into an array with it's parent location
function maker(loc, cmnt) {
  loc.forEach(function(loc) {
    let arrFin = [loc];
    let arr = cmnt.filter(function(cmnt) {
      if (cmnt._place === loc.id) {
        return cmnt;
      }
    });
    arrFin.push(arr);
    renderPlace(arrFin);
  });
  hideLoader();
}

// renders html elements to contain the comment and parent location data
function renderPlace(data) {
  let cmnts = '';

  for (let i = 0; i < data[1].length; i++) {
    cmnts += renderCmnt(data[1][i]);
  }
  let loc = `<section data-id="${data[0].id}" class="topLocs">
    <h4>${data[0].name}</h4>
    <img class="picture" src="${data[0].picture}" alt="lovely picture of ${
    data[0].name
  }">
    <section class="cmntBox">${cmnts}</section>
      <section class='addCmnt'>
        <button onclick="addBtn(this)" class="btn">Create</button>
      </section>
    </section>`;
  $('#locations').append(loc);
}

// renders html elements to contain each comment
function renderCmnt(cmnt) {
  return `<section>
    <p class="par" data-id="${cmnt._id}">${cmnt.comment}</p>
    <form>
      <textarea class="txt textArea">${cmnt.comment}</textarea>
    </form>
    <h5>-${cmnt.userName}</h5>
    <button onclick="edtBtn(this)" class='btn edit'>Edit</button>
    <button onclick="dltBtn(this)"  class='btn delete'>Delete</button>
  </section>`;
}

// creates a button and textarea under each location to create a comment
function addBtn(e) {
  $(e).hide();
  $(e.parentElement).append(
    `<textarea class='textArea' placeholder='Type your comment here...'></textarea>
    <button onclick='subAddBtn(this)' class='btn submit'>Submit</button>
    <button onclick='cancelAddBtn(this)' class='btn cancel'>Cancel</button>`
  );
}

// creates a button to submit the created comment
function subAddBtn(e) {
  let placeId = $(e)
    .closest('.topLocs')
    .data('id');
  let comment = $(e.parentElement.querySelector('.textArea')).val();

  if (comment === '') {
    $('#blankModal').show();
    $('#okBtn').on('click', function() {
      $('#blankModal').hide();
    });
  } else {
    $.ajax({
      url: '/locations/comment',
      data: JSON.stringify({
        userName: 'Admin',
        comment,
        _place: placeId
      }),
      type: 'POST',
      contentType: 'application/json',
      success: function(res) {
        const render = renderCmnt(res.UserComment);
        $(e)
          .closest('.topLocs')
          .find('.cmntBox')
          .append(render);
        removeSiblings(e, '.textArea, .submit, .cancel');
      }
    });
    showSiblings(e, '.addCmnt button');
  }
}

// creates a button to cancel the created comment
function cancelAddBtn(e) {
  showSiblings(e, '.addCmnt button');
  $(e.parentElement.querySelectorAll('.submit, .cancel, .textArea')).remove();
}

// creates a button and textarea to edit each comment
function edtBtn(e) {
  hideSiblings(e, '.par, .edit, .delete');
  $(e.parentElement).append(
    "<button onclick='subEdtBtn(this)' class='btn submit'>Submit</button>"
  );
  $(e.parentElement).append(
    "<button onclick='cancelBtn(this)' class='btn cancel'>Cancel</button>"
  );
  showSiblings(e, '.txt');
}

// creates a button to submit the edited comment
function subEdtBtn(e) {
  let id = $(e.parentElement.querySelector('.par')).data('id');
  let comment = $(e.parentElement.querySelector('.txt')).val();

  if (comment === '') {
    $('#blankModal').show();
    $('#okBtn').on('click', function() {
      $('#blankModal').hide();
    });
  } else {
    $.ajax({
      url: `/locations/comment/${id}`,
      data: JSON.stringify({
        comment
      }),
      type: 'PUT',
      contentType: 'application/json',
      success: function() {
        hideSiblings(e, '.txt, .submit');
        $(e.parentElement.querySelector('.par')).html(comment);
        showSiblings(e, '.par, .edit, .delete');
        removeSiblings(e, '.submit, .cancel');
      },
      error: function() {
        let message = 'unable to update item in the database';
        alert(message);
      }
    });
  }
}

// creates a button to cancel the edited comment
function cancelBtn(e) {
  let comment = $(e.parentElement.querySelector('.par')).html();

  $(e).hide();
  $(e.parentElement.querySelector('.txt')).val(comment);
  hideSiblings(e, '.txt');
  showSiblings(e, '.par, .edit, .delete');
  removeSiblings(e, '.submit, .cancel');
}

// creates a button to delete each comment
function dltBtn(e) {
  let id = $(e.parentElement.querySelector('.par')).data('id');

  $('#modal').show();

  $('#yesBtn').on('click', function() {
    $.ajax({
      url: `/locations/comment/${id}`,
      type: 'DELETE',
      success: function() {
        $(e.parentElement).remove();
      },
      error: function() {
        alert('unable to delete item from database');
      }
    });
    $('#modal').hide();
  });

  $('#noBtn').on('click', function() {
    $('#modal').hide();
  });
}

// hides selected elements in the dom
function hideSiblings(e, sel) {
  $(e.parentElement.querySelectorAll(sel)).hide();
}

// shows selected elements in the dom
function showSiblings(e, sel) {
  $(e.parentElement.querySelectorAll(sel)).show();
}

// removes selected elements from the dom
function removeSiblings(e, sel) {
  $(e.parentElement.querySelectorAll(sel)).remove();
}

// activates the ajax request to get all of the data
function getBtn() {
  $('#getBtn').submit(function(event) {
    event.preventDefault();
    getData();
    $('#locations').empty();
    showLoader();
  });
}

$(getBtn);
