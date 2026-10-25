package com.learning.aps.common.validator;

import com.learning.aps.common.constant.AttendanceConstant;
import java.util.regex.Pattern;

public final class MobileNumberValidator {

  private static final Pattern MOBILE_PATTERN =
      Pattern.compile(AttendanceConstant.MOBILE_NUMBER_REGEX);

  private MobileNumberValidator() {}

  public static boolean isValid(String mobileNumber) {
    return mobileNumber != null
        && !mobileNumber.isBlank()
        && MOBILE_PATTERN.matcher(mobileNumber.trim()).matches();
  }
}
