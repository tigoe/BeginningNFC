package com.megster.p2p.handover;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.nfc.NfcAdapter;
import android.nfc.NfcEvent;
import android.os.Bundle;
import android.app.Activity;
import android.provider.Settings;
import android.view.Menu;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

public class MainActivity extends Activity implements NfcAdapter.OnNdefPushCompleteCallback {

    private static int PICK_FILE_REQUEST = 1;
    private NfcAdapter nfcAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }

    public void chooseFile(View view) {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.putExtra(Intent.EXTRA_LOCAL_ONLY, true);

        Intent chooser = Intent.createChooser(intent, "Select File");
        startActivityForResult(chooser, PICK_FILE_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {

        if (requestCode == PICK_FILE_REQUEST) {
            if (resultCode == RESULT_OK) {
                Uri uri = data.getData();

                nfcAdapter.setOnNdefPushCompleteCallback(this, this);
                nfcAdapter.setBeamPushUris(new Uri[] {uri}, this);

                showToast("Tap another NFC phone to share file.");

            } else if (resultCode == RESULT_CANCELED) {
                showToast("Action Canceled");
            } else {
                showToast("Error (resultCode=" + resultCode + ").");
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        nfcAdapter = NfcAdapter.getDefaultAdapter(this);

        if (nfcAdapter == null) { // device doesn't have NFC
            showNfcHardwareRequiredDialog();
        } else if (!nfcAdapter.isEnabled()) {
            showEnableNfcDialog();
        } else if (!nfcAdapter.isNdefPushEnabled()) {
            showEnableBeamDialog();
        }
    }
    private void showToast(CharSequence message) {
        Context context = getApplicationContext();
        int duration = Toast.LENGTH_LONG;
        if (context != null) {
            Toast toast = Toast.makeText(context, message, duration);
            toast.show();
        }
    }

    private void showNfcHardwareRequiredDialog() {
        AlertDialog dialog = new AlertDialog.Builder(this).create();
        dialog.setTitle("NFC Required");
        dialog.setMessage("Your device does not have the NFC hardware required to run this application.");
        dialog.setButton(Dialog.BUTTON_POSITIVE, "OK", new DialogInterface.OnClickListener() {

            @Override
            public void onClick(DialogInterface dialog, int which) {
                disableButton();
            }
        });
        dialog.show();
    }

    private void showEnableNfcDialog() {
        AlertDialog dialog = new AlertDialog.Builder(this).create();
        dialog.setTitle("NFC Required");
        dialog.setMessage("This application requires NFC.");
        dialog.setButton(Dialog.BUTTON_POSITIVE, "Enable", new DialogInterface.OnClickListener() {

            @Override
            public void onClick(DialogInterface dialog, int which) {
                startActivity(new Intent(Settings.ACTION_NFC_SETTINGS));
            }
        });

        dialog.setButton(Dialog.BUTTON_NEGATIVE, "Ignore", new DialogInterface.OnClickListener() {

            @Override
            public void onClick(DialogInterface dialog, int which) {
                disableButton();
            }
        });
        dialog.show();
    }

    private void showEnableBeamDialog() {
        AlertDialog dialog = new AlertDialog.Builder(this).create();
        dialog.setTitle("Android Beam Required");
        dialog.setMessage("This application requires Android Beam.");
        dialog.setButton(Dialog.BUTTON_POSITIVE, "Enable", new DialogInterface.OnClickListener() {

            @Override
            public void onClick(DialogInterface dialog, int which) {
                startActivity(new Intent(Settings.ACTION_NFCSHARING_SETTINGS));
            }
        });

        dialog.setButton(Dialog.BUTTON_NEGATIVE, "Ignore", new DialogInterface.OnClickListener() {

            @Override
            public void onClick(DialogInterface dialog, int which) {
                disableButton();
            }
        });
        dialog.show();
    }

    private void disableButton() {
        Button button = (Button)this.findViewById(R.id.button);
        button.setEnabled(false);
    }

    @Override
    public void onNdefPushComplete(NfcEvent event) {
        runOnUiThread(new Runnable() {
            public void run() {
                showToast("Message sent to peer.");
            }
        });
    }


}
