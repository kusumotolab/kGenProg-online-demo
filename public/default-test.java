package example;

import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class CloseToZeroTest {
  @Test
  public void test01() {
    assertEquals(9, CloseToZero.run(10));
  }

  @Test
  public void test02() {
    assertEquals(0, CloseToZero.run(0));
  }

  @Test
  public void test03() {
    assertEquals(-9, CloseToZero.run(-10));
  }

}