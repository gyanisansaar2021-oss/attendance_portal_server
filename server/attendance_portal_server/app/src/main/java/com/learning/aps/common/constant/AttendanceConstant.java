package com.learning.aps.common.constant;

public final class AttendanceConstant {

  private AttendanceConstant() {}

  public static final int OTP_LENGTH = 6;
  public static final long OTP_EXPIRY_SECONDS = 300;
  public static final String MOBILE_NUMBER_REGEX = "^\\+?[1-9]\\d{6,14}$";
}