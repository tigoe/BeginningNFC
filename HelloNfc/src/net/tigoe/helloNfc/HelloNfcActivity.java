package net.tigoe.helloNfc;

import android.app.Activity;
import android.os.Bundle;
import org.apache.cordova.*;

public class HelloNfcActivity extends DroidGap {
    /** Called when the activity is first created. */
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}