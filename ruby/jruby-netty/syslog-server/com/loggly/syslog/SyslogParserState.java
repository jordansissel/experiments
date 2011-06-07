package com.loggly.syslog;

public enum SyslogParserState {
  START,
  READ_PRI,
  READ_PRI_START,
  READ_PRI_END,
  START_DATE,
  READ_MONTH,
  READ_DAY,
  READ_HOUR,
  READ_MINUTE,
  READ_SECOND,
  START_MESSAGE,
  READ_MESSAGE,
} /* SyslogParserState */
