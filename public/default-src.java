package example;

public class CloseToZero {
  public int run(int n) {
    if (n == 0) {
      n++; // bug here
    } else if (n > 0) {
      n--;
    } else {
      n++;
    }
    return n;
  }
}