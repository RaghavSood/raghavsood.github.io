$( document ).ready(function() {
    $(".button-collapse").sideNav();
    $('.scrollspy').scrollSpy({scrollOffset: 50});
    $('.experiencespy').scrollSpy({scrollOffset: 5});
    $('.experiencenav').pushpin({
      top: $('.experiencenav').offset().top - 15,
      bottom: $('#experience').offset().top + $('#experience').outerHeight() - $('.experiencenav').height() - 22.5,
      offset: 0
    });
});