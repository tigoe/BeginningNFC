package net.tigoe.helloPhoneGap;

import android.app.Activity;
import org.apache.cordova.*;
import android.os.Bundle;

public class HelloPhoneGapActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}