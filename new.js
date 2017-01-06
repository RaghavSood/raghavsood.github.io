$( document ).ready(function() {
    $(".button-collapse").sideNav();
    $('.scrollspy').scrollSpy({scrollOffset: 50});
    $('.experiencespy').scrollSpy({scrollOffset: 5});
    $('.experiencenav').pushpin({
      top: $('.experiencenav').offset().top - 15,
      bottom: $('#brilliant').offset().top + $('#brilliant').outerHeight() - $('.experiencenav').height(),
      offset: 0
    });
});