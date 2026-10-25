package com.learning.aps.api.rest.attendance;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceRestController {

  @GetMapping("/hello")
  public String hello() {
    return "Hello World";
  }
}
