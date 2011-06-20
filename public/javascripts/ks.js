var mode = 'grid'; //two modes: 'grid' or 'slide'

$(function() {
		
    $('#slider').click(function() {
        var pos = $(this).css('background-position');
        if (pos == '0px -66px' || '0% -66px') {
            newpos = '0px -33px';
		
			$('.column').fadeOut('slow', function(){
				$(this).remove();
				mode = 'slide';
			});
			console.log('changed mode to slide');
        }
        if (pos == '0px -33px' || pos == '0% -33px') {
            newpos = '0px -66px';

			console.log('changed mode to grid');

			$('#slidecol').fadeOut('slow', function() {
				$(this).remove();
				mode = 'grid';
			});
        }
        $(this).css('background-position', newpos);
    });
    
});

