$(function() {
    "use strict";
    var max = 3;

    var textarea = $('textarea');
    var pre = $('pre');

    var timeD = 999999;
    var timeN = -1;

    var persons = [];
    var competitionCount = 0;

    var Entry = function( time ) {
        var points = 0;

        if ( time === "" ) {
            time = timeN;
        } else if ( time === "D" ) {
            time = timeD;
        } else if (typeof time != 'number') {
            time = parseFloat(time.replace(/,/,'.'));
        }

        this.getTime = function() {
            return time;
        };

        this.getPoints = function() {
            return points;
        };

        this.setPoints = function(p) {
            p = p + "";
            if (p.match(/[0-9]{1,2}/)) {
                points = parseInt(p);
            } else {
                points = 0;
            }
        };

        this.toString = function () {
            var output = time2string(time);

            output += "\t";

            if (points != 0) output += points
            return output;
        };
    };

    var time2string = function (time) {
        if (time >= timeD) {
            return "D";
        } else if (time === timeN) {
            return "";
        } else {
            return ((Math.round(time * 100) / 100) + "").replace(/\./,',');
        }
    };

    var Person = function( name ) {
        var entries = [];
        var firstname;
        var points = 0;
        var time = timeD;
        var bestTime = timeD;
        var part = 0;

        this.setFirstname = function( f ) {
            firstname = f;
        };

        this.getEntries = function() {
            return entries;
        };

        this.getClonedEntries = function () {
            var es = [];
            var i, e;
            for (i = 0; i < entries.length; i++) {
                e = new Entry(entries[i].getTime());
                e.setPoints(entries[i].getPoints());
                es.push(e);
            }
            return es;
        };

        this.getName = function() {
            return name;
        };

        this.getFirstname = function() {
            return firstname;
        };

        this.addEntry = function( entry ) {
            entries.push(entry);
        };

        this.toString = function () {
            var output = name + "\t" + firstname;
            var i;
            for ( i = 0; i < entries.length; i++) {
                output += "\t" + entries[i];
            }
            var e = new Entry(bestTime);
            e.setPoints(points);

            output += "\t" + this.getTimeLength() + "\t" + time2string(time) + "\t" + e;
            return output;
        };

        this.setPoints = function (p) {
            points = p;
        };

        this.getPoints = function() {
            return points;
        };

        this.setPart = function (p) {
            part = p;
        };

        this.getPart = function () {
            return part;
        };

        this.getTimeLength = function () {
            var i, length = 0;
            for (i = entries.length - 1; i >= 0; i--) {
                if (entries[i].getTime() != timeN) length++;
            }
            return length;
        };

        this.setTime = function (t) {
            time = t;
        };

        this.getTime = function () {
            return time;
        };

        this.setBestTime = function (t) {
            bestTime = t;
        };

        this.getBestTime = function() {
            return bestTime;
        };
    };

    var outputToPre = function () {
        calculateResult();

        pre.text("");
        var i;
        for (i = 0; i < persons.length; i++) {
            pre.text(pre.text() + persons[i] + "\n");
        }
    };

    var searchPerson = function ( name, firstname ) {

        var i;
        for (i = 0; i < persons.length; i++) {
            if (persons[i].getName() == name && persons[i].getFirstname() == firstname) {
                return persons[i];
            }
        }
        return null;
    };

    var calculateResult = function () {
        var i, entries, j, points, time, bestTime, part;
        for (i = 0; i < persons.length; i++) {

            entries = persons[i].getClonedEntries();
            entries.sort(function(a, b) {
                if (a.getPoints() < b.getPoints()) return 1;
                if (a.getPoints() > b.getPoints()) return -1;

                if (a.getTime() > b.getTime()) return 1;
                if (a.getTime() < b.getTime()) return -1;

                return 0;
            });

            points = 0;
            time = 0;
            bestTime = timeD;
            part = 0;

            for (j = 0; j < entries.length && j < max; j++) {
                if (entries[j].getTime() == timeN) continue;
                part++;
                points += entries[j].getPoints();
                time += entries[j].getTime();
                bestTime = Math.min(bestTime, entries[j].getTime());
            }
            persons[i].setPoints(points);
            persons[i].setTime(time);
            persons[i].setBestTime(bestTime);
            persons[i].setPart(part);
        }

        persons.sort(function( a , b ) {
            if (a.getPart() < b.getPart()) return 1;
            if (a.getPart() > b.getPart()) return -1;

            if (a.getPoints() < b.getPoints()) return 1;
            if (a.getPoints() > b.getPoints()) return -1;

            if (a.getTime() > b.getTime()) return 1;
            if (a.getTime() < b.getTime()) return -1;

            if (a.getBestTime() > b.getBestTime()) return 1;
            if (a.getBestTime() < b.getBestTime()) return -1;

            return 0;
        });
    };


    $('#btnCurrentList').click(function() {
        var content = textarea.val();
        var lines = content.split("\n");

        var maxCompetitionCount = 0;
        var currentCompetitionCount = 0;

        var i, j, cols, entry, person;
        for (i = 0; i < lines.length; i++) {
            currentCompetitionCount = 0;

            cols = lines[i].split("\t");

            if (cols.length < 2) continue;

            for (j = 0; j < cols.length; j++) {
                if (j == 0) person = new Person( cols[j] );
                else if (j == 1) person.setFirstname( cols[j] );
                else {
                    if (j % 2 == 0) {
                        entry = new Entry( cols[j] );
                    } else {
                        entry.setPoints( cols[j] );
                        person.addEntry(entry);
                        currentCompetitionCount++;
                    }
                }
            }

            maxCompetitionCount = Math.max(currentCompetitionCount);
            persons.push(person);
        }
        competitionCount = maxCompetitionCount;
        outputToPre();
    });


    $('#btnNextList').click(function() {
        var content = textarea.val();
        var lines = content.split("\n");

        var i, j, o, cols, entry, person, person2;
        for (i = 0; i < lines.length; i++) {

            cols = lines[i].split("\t");

            if (cols.length != 3) continue;

            for (j = 0; j < cols.length; j++) {
                if (j == 0) person2 = new Person( cols[j] );
                else if (j == 1) {
                    person2.setFirstname( cols[j] );

                    person = searchPerson(person2.getName(), person2.getFirstname());
                    if ( person == null) {
                        person = person2;
                        for ( o = 0; o < competitionCount; o++) {
                            person.addEntry(new Entry(timeN));
                        }
                        persons.push(person);
                    }
                } else {
                    entry = new Entry( cols[j] );
                    person.addEntry(entry);
                }
            }
        }

        competitionCount++;

        for (i = 0; i < persons.length; i++) {
            while (persons[i].getEntries().length < competitionCount) {
                persons[i].addEntry(new Entry(timeN));
            }
        }

        persons.sort(function(p1, p2) {
            var e1 = p1.getEntries();
            var e2 = p2.getEntries();
            var last1 = e1[e1.length - 1];
            var last2 = e2[e2.length - 1];

            if (last1.getTime() == timeN) return 1;
            if (last2.getTime() == timeN) return -1;
            if (last1.getTime() == timeD) return 1;
            if (last2.getTime() == timeD) return -1;

            return last1.getTime() - last2.getTime();
        });

        j = 20;
        for (i = 0; i < persons.length; i++) {
            var e = persons[i].getEntries();
            var last = e[e.length - 1];

            if (last.getTime() == timeN) break;

            last.setPoints(j);
            j--;
            if (j < 1) break;
        }

        outputToPre();
    });
});
