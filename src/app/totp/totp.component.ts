import { Component, OnInit } from '@angular/core';
import base32Encode from 'base32-encode';
import * as crypto from 'crypto-js';

@Component({
  selector: 'totp-totp',
  templateUrl: './totp.component.html',
  styleUrls: ['./totp.component.scss'],
})
export class TotpComponent implements OnInit {
  // Der Schlüssel
  public key!: crypto.lib.WordArray;

  // Der Epoch timer
  public time!:crypto.lib.WordArray;

  // Der Hash
  public hash!:crypto.lib.WordArray;

  // HEX zum Konvertieren
  public HEX = crypto.enc.Hex;

  constructor() {}

  ngOnInit(): void {
    // Key hinterlegen
    //this.key = crypto.lib.WordArray.random(20);
    this.key = crypto.enc.Hex.parse("ad057be6403fb73a250cf6b1fd6f343564f73b3d");

    /*console.log(this.getEpochIteration());

    console.log(this.generateKey());

    var hex = this.convertStringToUint8(
      '04ae9095255786d49e6316b1fcc2bc08f4a67687'
    );
    //console.log(hex)
    console.log(base32Encode(hex, 'RFC3548'));

    const key = crypto.enc.Hex.parse(
      '04ae9095255786d49e6316b1fcc2bc08f4a67687'
    );
    console.log(key);*/


    this.time = crypto.enc.Hex.parse(this.getEpochIteration());

    this.hash = crypto.HmacSHA1(this.time, this.key);
    //const msg = crypto.enc.Hex.parse('00000000034882ba');
    /*console.log(msg);

    var hash = crypto.HmacSHA1(msg, key).toString(crypto.enc.Hex);

    console.log(hash);
    //console.log(this.convertStringToUint8(hash));
    //console.log(this.convertStringToUint8(hash));
    var off = this.convertStringToUint8(hash)[19] & 15;

    console.log(off);
    const hashcut = hash.substring(off * 2, off * 2 + 8)
    console.log(hashcut);
    var numb = Number("0x"+hashcut);
    console.log(~(1 << 31))
    numb = numb & (~(1 << 31))
    console.log(numb)
    console.log(numb % 1000000)

    //console.log(this.convertStringToUint8(hash)[off] * 256);*/
  }

  /**
   * Diese Methode Konvertiert einen Hex String in ein Uint8Array
   * @param hex der Hex Key
   * @returns ein Unit8Array
   */
  convertStringToUint8(hex: any): Uint8Array {
    // Konvertieren
    return new Uint8Array(
      hex.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
    );
  }

  /**
   * Diese Methode erzeugt einen Key
   * @returns den Key
   */
  generateKey(): string {
    // Key erzeugen
    return crypto.lib.WordArray.random(20)
      .words.map((number) => number.toString(16))
      .join('');
  }

  getEpochIteration(): string {
    // EpochTime erzeugen
    const time = Math.floor(Date.now() / 1000 / 30);

    // String erzeugen
    var ret = time.toString(16);

    // String verlängern
    while (ret.length < 16) {
      ret = '0' + ret;
    }

    return ret;
  }

  base32EncodeKey(): string {
    return base32Encode(
      this.convertStringToUint8(this.key.toString(this.HEX)),
      'RFC3548'
    );
  }

  getCalculatedNumber():number{
    var off = this.convertStringToUint8(this.hash.toString(this.HEX))[19] & 15;

    const hashcut = this.hash.toString(this.HEX).substring(off * 2, off * 2 + 8)

    var numb = Number("0x"+hashcut);

    numb = numb & (~(1 << 31))

    return numb % 1000000
  }
}
