var MD5 = require('MD5');
var commonmark = require('./commonmark');

var daysInWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  "Saturday", "Sunday"];
var monthsInYear = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
var aMonths = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
var aDays = new Array( "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");

// accepts the client's time zone offset from GMT in minutes as a parameter.
// returns the timezone offset in the format [+|-}DDDD
function getTZOString(timezoneOffset)
{
  var hours = Math.floor(timezoneOffset / 60);
  var modMin = Math.abs(timezoneOffset % 60);
  var s = new String();
  s += (hours > 0) ? "-" : "+";
  var absHours = Math.abs(hours);
  s += (absHours < 10) ? "0" + absHours :absHours;
  s += ((modMin == 0) ? "00" : modMin);
  return(s);
}

module.exports = {
  inspect: require(process.binding('natives').util ? 'util' : 'sys').inspect,
  intro: function intro(content) {
    var html = commonmark(content);
    var match = /<h[0-9]>/.exec(html);
    if (match) {
      html = html.substr(0, match.index);
    }
    return html;
  },
  markdownEncode: function markdownEncode(content) {
    return commonmark(content+"");
  },
  github: function github(name) {
    return '<a href="http://github.com/' + name + '">' + name + '</a>';
  },
  bitbucket: function bitbucket(name) {
    return '<a href="http://bitbucket.com/' + name + '">' + name + '</a>';
  },
  twitter: function twitter(name) {
    return '<a href="http://twitter.com/' + name + '">' + name + '</a>';
  },
  gravitar: function gravitar(email, size) {
    size = size || 200;
    return "http://www.gravatar.com/avatar/" +
      MD5((email+"").trim().toLowerCase()) +
      "?r=pg&s=" + size + ".jpg&d=identicon";
  },
  formatDate: function formatDate(val, format) {
    var date = new Date(val),
        match, value;
    while (match = format.match(/(%[a-z%])/i)) {
      switch (match[1]) {
        case "%Y": // A full numeric representation of a year, 4 digits
          value = date.getFullYear(); break;
        case "%m": // Numeric representation of a month, with leading zeros
          value = pad(date.getMonth() + 1); break;
        case "%F": // A full textual representation of a month like March
          value = monthsInYear[date.getMonth()]; break;
        case "%d": // Day of the month, 2 digits with leading zeros
          value = pad(date.getDate()); break;
        case "%j": // Day of the month without leading zeros
          value = date.getDate(); break;
        case "%l": // A full textual representation of the day of the week
          value = daysInWeek[date.getDay()]; break;
        case "%H": // 24-hour format of an hour with leading zeros
          value = pad(date.getHours()); break;
        case "%i": // Minutes with leading zeros
          value = pad(date.getMinutes()); break;
        case "%s": // Seconds, with leading zeros
          value = pad(date.getSeconds()); break;
        case "%u": // milliseconds with leading zeroes
          value = pad(date.getMilliseconds(), 3); break;
        case "%z": // time zone offset
          value = getTZOString(date.getTimezoneOffset()); break;
        case "%%": // literal % sign
          value = "\0%\0"; break;
        default:
          value = ""; break;
      }
      format = format.replace(match[1], value);
    }
    format = format.split("\0%\0").join("%");
    return format;
  },
  formatRFC822Date: function formatRFC822Date(val)
  {
    var oDate = new Date(val);
    var dtm = new String();

    dtm = aDays[oDate.getDay()] + ", ";
    dtm += pad(oDate.getDate()) + " ";
    dtm += aMonths[oDate.getMonth()] + " ";
    dtm += oDate.getFullYear() + " ";
    dtm += pad(oDate.getHours()) + ":";
    dtm += pad(oDate.getMinutes()) + ":";
    dtm += pad(oDate.getSeconds()) + " " ;
    dtm += getTZOString(oDate.getTimezoneOffset());
    return dtm;
  }

};

function pad(num, count) {
  count = count || 2;
  num = "" + num;
  for (i = num.length; i < count; i ++) num = "0" + num;
  return num;
}