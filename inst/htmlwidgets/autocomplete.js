HTMLWidgets.widget({

  name: 'autocomplete',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {


  $(el).append("<h2>Capstone: Auto-complete using 3-gram model with Kneser-Ney smoothing</h2>");
  $(el).append("<p>Please enter text below</p>");
  $(el).append("<textarea  rows=\"10\" cols=\"60\" id=\"topic_title\"></textarea>");
  $(el).append("<p>Author: pmohan</p>");
  $(el).append("<p>Date: 2017-6-20<p>");

 // $(".autocomplete").autocomplete({
//    source: availableTags
//  });

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
