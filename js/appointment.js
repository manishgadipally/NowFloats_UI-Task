
$(document).ready(function() {
  var value = moment(new Date());
  var formattedDate = "Today (" + value.format("ddd, D MMM") + ")";
  $("#dateCtrl").text(formattedDate);
  $("#hdnDateCtrlVal").val(value.format("YYYY MMM DD"));
  $("#btnNavPrev").addClass("disabled");
  onDateSelected(0);
});

function onDateSelected(dateindex) {
  var dateCtrlValue = $("#hdnDateCtrlVal").val();
  var dateMoment = moment(dateCtrlValue, "YYYY MMM DD");
  dateMoment = dateindex >= 0 ? dateMoment.add(dateindex, 'day') : dateMoment.subtract(1, 'day');
  if(dateMoment.isSame(new Date(), 'day')){
    $("#dateCtrl").text("Today (" + dateMoment.format("ddd, D MMM") + ")");
    $("#btnNavPrev").addClass("disabled");
  }
  else{
    $("#dateCtrl").text(dateMoment.format("ddd, D MMM"));
    $("#btnNavPrev").removeClass("disabled");
  }
  $("#hdnDateCtrlVal").val(dateMoment.format("YYYY MMM DD"));
  initializeTable();
  $.ajax({
    url: "data/appointmentslots.json",
    success: function(result) {
      var dateSlot = result.find(function(dt) {
        var val = new Date(dateMoment.toDate());
        var formattedDate =
          val.getMonth() + 1 + "/" + val.getDate() + "/" + val.getFullYear();
        return dt.date == formattedDate;
      });
      var table = document.getElementById("tblSolts");
      var tr = table.getElementsByTagName("tr");
      if (dateSlot) {
        var thirtyMinSlots = [];
        dateSlot.slots.forEach(function(slot) {
          var dateObj = new Date("November 13, 2013 " + slot.time);
          thirtyMinSlots.push({
            slotTime: getNearestHalfHourTimeString(dateObj),
            isAvailable: slot.isAvailable
          });
        });
        for (var i = 0; i < tr.length; i++) {
          for (var j = 0; j < tr[i].cells.length; j++) {
            var td = tr[i].getElementsByTagName("td")[j];
            if (td) {
              var slot = thirtyMinSlots.find(function(timeVal) {
                return timeVal.slotTime == td.innerText;
              });
              if (slot) {
                if (slot.isAvailable) {
                  td.classList.remove("disabledSlot");
                } else {
                  td.classList.add("disabledSlot");
                }
              } else {
                td.innerText = "-";
              }
            }
          }
        }
      } else {
        for (var i = 0; i < tr.length; i++) {
          for (var j = 0; j < tr[i].cells.length; j++) {
            var td = tr[i].getElementsByTagName("td")[j];
            if (td) {
              td.innerText = "-";
            }
          }
        }
      }
    }
  });
}

function initializeTable() {
  var table = document.getElementById("tblSolts");
  var tr = table.getElementsByTagName("tr");
  var times = intervals("2016-08-10 9:59:00 AM", "2016-08-10 10:59:00 PM");
  for (var i = 0, k = 0; i < tr.length; i++) {
    for (var j = 0; j < tr[i].cells.length; j++) {
      var td = tr[i].getElementsByTagName("td")[j];
      if (td) {
        td.innerText = times[k];
        k++;
      }
    }
  }
}

function intervals(startString, endString) {
  var start = moment(startString, "YYYY-MM-DD hh:mm a");
  var end = moment(endString, "YYYY-MM-DD hh:mm a");
  start.minutes(Math.ceil(start.minutes() / 30) * 30);
  var result = [];
  var current = moment(start);
  while (current <= end) {
    result.push(current.format("h:mm A"));
    current.add(30, "minutes");
  }

  return result;
}

function getNearestHalfHourTimeString(dateObj) {
  var hour = dateObj.getHours();
  var minutes = dateObj.getMinutes();
  var ampm = "AM";
  if (minutes < 15) {
    minutes = "00";
  } else if (minutes < 45) {
    minutes = "30";
  } else {
    minutes = "00";
    ++hour;
  }
  if (hour > 23) {
    hour = 12;
  } else if (hour > 12) {
    hour = hour - 12;
    ampm = "PM";
  } else if (hour == 12) {
    ampm = "PM";
  } else if (hour == 0) {
    hour = 12;
  }

  return hour + ":" + minutes + " " + ampm;
}
