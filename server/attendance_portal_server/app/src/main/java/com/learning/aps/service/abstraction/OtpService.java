package com.learning.aps.service.abstraction;

import java.util.concurrent.CompletableFuture;

public interface OtpService {

  CompletableFuture<String> generateOtp(String mobileNumber);

  CompletableFuture<Boolean> verifyOtp(String mobileNumber, String otp);

  CompletableFuture<Void> invalidateOtp(String mobileNumber);
}
