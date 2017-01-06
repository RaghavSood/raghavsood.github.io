$( document ).ready(function() {
    $(".button-collapse").sideNav();
    $('.scrollspy').scrollSpy({scrollOffset: 20});
    $('.experiencespy').scrollSpy({scrollOffset: 5});
    $('.experiencenav').pushpin({
      top: $('.experiencenav').offset().top - 15,
      bottom: $('#brilliant').offset().top + $('#brilliant').outerHeight() - $('.experiencenav').height(),
      offset: 0
    });
    $('.talksspy').scrollSpy({scrollOffset: 5});
    $('.talksnav').pushpin({
      top: $('.talksnav').offset().top - 15,
      bottom: $('#npc').offset().top + $('#npc').outerHeight() - $('.talksnav').height(),
      offset: 0
    });
});