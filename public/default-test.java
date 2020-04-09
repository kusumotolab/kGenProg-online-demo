package example;

import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class CloseToZeroTest {
  @Test
  public void test01() {
    assertEquals(4, CloseToZero.run(5));
  }

  @Test
  public void test02() {
    assertEquals(0, CloseToZero.run(0));
  }

  @Test
  public void test03() {
    assertEquals(-4, CloseToZero.run(-5));
  }

}