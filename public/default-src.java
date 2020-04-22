package example;

public class CloseToZero {

  /* Increase or reduce the given value to be close to zero. */
  public static int run(int n) {
    if (n == 0) {
      n++; // a bug here. zero should be zero
    } else if (n > 0) {
      n--;
    } else {
      n++;
    }
    return n;
  }

}