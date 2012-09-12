# Getting an ISO8601-form time in Ruby

## Parsing a syslog time into IS8601 time

                                             user     system      total        real
    Joda parseDateTime                   2.856000   0.000000   2.856000 (  2.856000)
    SimpleDateFormat parse               2.897000   0.000000   2.897000 (  2.897000)

## Getting 'now' in ISO8601 time

                                             user     system      total        real
    SimpleDateFormat                     3.454000   0.000000   3.454000 (  3.454000)
    Joda Instant                         2.686000   0.000000   2.686000 (  2.686000)
    Joda DateTime                        2.704000   0.000000   2.704000 (  2.703000)
    Ruby sprintf+Time.now                3.738000   0.000000   3.738000 (  3.738000)


Joda is superior.
