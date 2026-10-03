$(function () {
  var USERS_KEY = 'cosmicUsers';
  var SESSION_KEY = 'cosmicUser';

  // Static credentials required by the assignment
  var STATIC_USER = { username: 'admin', password: '12345', name: 'admin' };

  // Already logged in? Skip straight to the landing page.
  if (sessionStorage.getItem(SESSION_KEY)) {
    location.replace('index.html');
    return;
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function showAlert(type, message) {
    $('#formAlert')
      .removeClass('success error')
      .addClass(type)
      .text(message)
      .prop('hidden', false);
  }

  function hideAlert() {
    $('#formAlert').prop('hidden', true).text('');
  }

  // Custom rules
  $.validator.addMethod('strictEmail', function (value, element) {
    return this.optional(element) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }, 'Please enter a valid email address (e.g. name@example.com).');

  $.validator.addMethod('strongPassword', function (value, element) {
    return this.optional(element) || (/[A-Za-z]/.test(value) && /\d/.test(value));
  }, 'Password must contain at least one letter and one number.');

  $.validator.addMethod('validName', function (value, element) {
    return this.optional(element) || /^[A-Za-z][A-Za-z\s'.-]*$/.test(value.trim());
  }, 'Name can only contain letters, spaces, hyphens and apostrophes.');

  // Shared validator settings
  var common = {
    errorElement: 'small',
    errorClass: 'is-invalid',
    validClass: 'is-valid',
    onkeyup: function (el) { $(el).valid(); },
    highlight: function (el, errorClass, validClass) {
      $(el).addClass(errorClass).removeClass(validClass);
    },
    unhighlight: function (el, errorClass, validClass) {
      $(el).removeClass(errorClass).addClass(validClass);
    }
  };

  /* ------------------------------ LOGIN ------------------------------ */
  $('#loginForm').validate($.extend({}, common, {
    onkeyup: false, // don't nag while typing on login
    rules: {
      username: { required: true },
      password: { required: true }
    },
    messages: {
      username: { required: 'Username or email is required.' },
      password: { required: 'Password is required.' }
    },
    submitHandler: function (form) {
      hideAlert();
      var id = $.trim($('#username').val());
      var pw = $('#password').val();
      var name = null;

      // 1) Static credentials
      if (id === STATIC_USER.username && pw === STATIC_USER.password) {
        name = STATIC_USER.name;
      } else {
        // 2) Users created through the registration page
        var match = getUsers().filter(function (u) {
          return u.email.toLowerCase() === id.toLowerCase() && u.password === pw;
        })[0];
        if (match) name = match.name;
      }

      if (name) {
        sessionStorage.setItem(SESSION_KEY, name);
        showAlert('success', 'Login successful! Redirecting…');
        setTimeout(function () { location.href = 'index.html'; }, 600);
      } else {
        showAlert('error', 'Invalid username or password. Please try again.');
        $('#password').val('').removeClass('is-valid').focus();
      }
      return false;
    }
  }));

  $('#loginForm input').on('input', hideAlert);

  /* ---------------------------- REGISTRATION ---------------------------- */
  $('#registerForm').validate($.extend({}, common, {
    rules: {
      fullname: { required: true, minlength: 2, validName: true },
      email: { required: true, strictEmail: true },
      password: { required: true, minlength: 8, strongPassword: true },
      confirm_password: { required: true, equalTo: '#reg-password' }
    },
    messages: {
      fullname: {
        required: 'Full name is required.',
        minlength: 'Full name must be at least 2 characters.'
      },
      email: { required: 'Email address is required.' },
      password: {
        required: 'Password is required.',
        minlength: 'Password must be at least 8 characters long.'
      },
      confirm_password: {
        required: 'Please confirm your password.',
        equalTo: 'Passwords do not match.'
      }
    },
    submitHandler: function (form) {
      hideAlert();
      var name = $.trim($('#fullname').val());
      var email = $.trim($('#email').val());
      var users = getUsers();

      var exists = users.some(function (u) {
        return u.email.toLowerCase() === email.toLowerCase();
      });

      if (exists) {
        showAlert('error', 'An account with this email already exists. Try logging in.');
        return false;
      }

      users.push({ name: name, email: email, password: $('#reg-password').val() });
      saveUsers(users);

      showAlert('success', 'Account created successfully! Redirecting to login…');
      form.reset();
      $('#registerForm input').removeClass('is-valid is-invalid');
      setTimeout(function () { location.href = 'login.html'; }, 1800);
      return false;
    }
  }));

  // Re-validate confirm password when the password changes
  $('#reg-password').on('keyup change', function () {
    if ($('#confirm-password').val() !== '') $('#confirm-password').valid();
  });
});
