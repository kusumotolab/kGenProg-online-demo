package example;

import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class CloseToZeroTest {
  @Test
  public void test01() {
    assertEquals(9, new CloseToZero().run(10));
  }

  @Test
  public void test02() {
    assertEquals(99, new CloseToZero().run(100));
  }

  @Test
  public void test03() {
    assertEquals(0, new CloseToZero().run(0));
  }

  @Test
  public void test04() {
    assertEquals(-9, new CloseToZero().run(-10));
  }
}