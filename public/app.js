// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<div data-id='" + data[i]._id + "'><div class='title'>" + data[i].title + "</div><a class='link' target='_blank' href='" + data[i].link + "'>" + data[i].link + "</a></div>");
    }
  });
 