$(function () {
  var name = sessionStorage.getItem('cosmicUser');
  if (!name) { location.replace('login.html'); return; }

  // .text() keeps user-provided names safe from HTML injection
  $('#welcomeName').text(name);
  $('body').removeClass('d-none');

  $('#logoutBtn').on('click', function (e) {
    e.preventDefault();
    sessionStorage.removeItem('cosmicUser');
    location.href = 'login.html';
  });
});
