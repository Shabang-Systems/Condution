var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

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

var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
  'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

$('.task-tag').tagsinput({
  typeaheadjs: {
    name: 'states',
    source: substringMatcher(states)
  }
});

