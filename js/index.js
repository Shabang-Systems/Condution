function showPage(pageId){
    $("#"+pageId).css("display", "block");
    $("#content-area").children().each(function(){
        let item = $(this)
        if (item.attr("id") != pageId){
           item.css("display", "none")
       }
    });
}

var active = "today"

$(document).on('click', '.perspective', function(e) {
    $("#"+active).removeClass('today-highlighted perspective-selected')
    showPage("perspective-page")
    active = $(this).attr('id')
    if (active.includes("today")){
        $("#"+active).addClass("today-highlighted")
    } else if (active.includes("perspective")){
        $("#"+active).addClass("perspective-selected")
    }

    //console.log($(this).attr("id"));
    
})

$(document).on('click', '.today', function(e) {

    $("#"+active).removeClass('today-highlighted perspective-selected')
    showPage("upcoming-page")
    active = $(this).attr('id')
    if (active.includes("today")){
        $("#"+active).addClass("today-highlighted")
    } else if (active.includes("perspective")){
        $("#"+active).addClass("perspective-selected")
    }
    //console.log($(this).attr("id"));
})

$('.editable-select').editableSelect({
    effects: 'fade',
    duration: 200,
    appendTo: 'body',
});

function smartParse(timeformat, timeString, o) {
    // smart, better date parsing with chrono
    console.log("tes");
    var d = chrono.parse(timeString)[0].start.date();
    return {
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
        millisec: d.getMilliseconds(),
        microsec: d.getMicroseconds(),
        timezone: d.getTimezoneOffset() * -1
    };
}

$('.datebox').datetimepicker({
    timeInput: true,
    timeFormat: "hh:mm tt",
	showHour: false,
	showMinute: false,
});

