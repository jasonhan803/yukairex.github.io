App = {


    init: function() {
        console.log("test")
      // Load pets.
      $.getJSON('./players.json', function(data) {
        var playersRow = $('#playersRow');
        var playersTemplate = $('#playersTemplate');
  
        for (i = 0; i < data.length; i ++) {
          playersTemplate.find('#name').text(data[i].name);
          playersTemplate.find('img').attr('src', data[i].picture);
        //   playersTemplate.find('.pet-breed').text(data[i].breed);
        //   playersTemplate.find('.pet-age').text(data[i].age);
        //   playersTemplate.find('.pet-location').text(data[i].location);
        //   playersTemplate.find('.btn-adopt').attr('data-id', data[i].id);
          playersRow.append(playersTemplate.html());
        }
      });
  
    //   return App.initWeb3();
    },
  
    // initWeb3: function() {
    //   /*
    //    * Replace me...
    //    */
  
    //   return App.initContract();
    // },
  
    // initContract: function() {
    //   /*
    //    * Replace me...
    //    */
  
    //   return App.bindEvents();
    // },
  
    // bindEvents: function() {
    //   $(document).on('click', '.btn-adopt', App.handleAdopt);
    // },
  
    // markAdopted: function(adopters, account) {
    //   /*
    //    * Replace me...
    //    */
    // },
  
    // handleAdopt: function(event) {
    //   event.preventDefault();
  
    //   var petId = parseInt($(event.target).data('id'));
  
    //   /*
    //    * Replace me...
    //    */
    // }
  
  };



$(function() {
    $(window).load(function() {
      App.init();
    });
  });