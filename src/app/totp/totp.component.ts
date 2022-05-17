import { Component, OnInit } from '@angular/core';
import base32Encode from 'base32-encode';
import * as crypto from 'crypto-js';
import { interval } from 'rxjs';



@Component({
  selector: 'totp-totp',
  templateUrl: './totp.component.html',
  styleUrls: ['./totp.component.scss'],
})
export class TotpComponent implements OnInit {
  // Der Schlüssel
  public key!: crypto.lib.WordArray;

  // Der Epoch timer
  public time!: crypto.lib.WordArray;

  // Der Hash
  public hash!: crypto.lib.WordArray;

  // HEX zum Konvertieren
  public HEX = crypto.enc.Hex;

  // Offset
  public off!:number;

  // Regex
  public REG = /.{1,4}/g;

  // Wert für Progressbar
  public val:number = 0;

  constructor() {}

  ngOnInit(): void {
    // Key hinterlegen
    this.key = crypto.lib.WordArray.random(20);
    //this.key = crypto.enc.Hex.parse('ad057be6403fb73a250cf6b1fd6f343564f73b3d');

    this.time = crypto.enc.Hex.parse(this.getEpochIteration());

    this.hash = crypto.HmacSHA1(this.time, this.key);

    this.off = this.convertStringToUint8(this.hash.toString(this.HEX))[19] & 15;

    setTimeout(()=>{

      const sub = interval(30000).subscribe( _ =>{
        this.time = crypto.enc.Hex.parse(this.getEpochIteration());

        this.hash = crypto.HmacSHA1(this.time, this.key);

        this.off = this.convertStringToUint8(this.hash.toString(this.HEX))[19] & 15;
      });

      this.time = crypto.enc.Hex.parse(this.getEpochIteration());

      this.hash = crypto.HmacSHA1(this.time, this.key);

      this.off = this.convertStringToUint8(this.hash.toString(this.HEX))[19] & 15;

    },30000 - (Date.now() % 30000) + 50);

    // Wert für Progressbar setzen
    this.val = Math.floor((30000 - (Date.now() % 30000) )/ 1000);

    // Wert für Progress updaten
    const sub = interval(1000).subscribe( _ =>{
      // val dekrementieren
      this.val--;

      // Val zurücksetzen
      if(this.val <= 0){
        this.val = 30 + this.val;
      }
    });


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
   * Diese Methode liefert die Aktuelle Epoch Iteration zurück
   * @returns die EpochIteration
   */
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

  /**
   * Diese Methode wandelt den Schlüssel um
   * @returns den umgewandelten Schlüssel
   */
  base32EncodeKey(): string {
    return base32Encode(
      this.convertStringToUint8(this.key.toString(this.HEX)),
      'RFC3548'
    );
  }

  /**
   * Diese Methode berechnet den AUTH-Code
   * @returns der Auth-Code
   */
  getCalculatedNumber(format:boolean = false): string {
    // Offset berechnen
    var off = this.convertStringToUint8(this.hash.toString(this.HEX))[19] & 15;

    // Umwandeln
    const hashcut = this.hash
      .toString(this.HEX)
      .substring(off * 2, off * 2 + 8);

    // Umwandeln
    var numb = Number('0x' + hashcut);

    // Erstes Bit null setzen
    numb = numb & ~(1 << 31);

    // Modulo rechnen
    var ret = (numb % 1000000).toString();

    if(format){
      // Formatieren
      while(ret.length < 6){
        // 0 hinzufuegen
        ret = "0"+ret;
      }

      // In Mitte teilen
      ret = ret.substring(0,3)+" "+ret.substring(3,6);
    }

    // Zurückliefern
    return ret;
  }

  /**
   * Diese Methode formatiert den HashWert
   * @returns den formatierten HashWert
   */
  formatHash(): string {
    // String berechnen
    var hash = this.hash.toString(this.HEX);

    // Offset berechnen
    var off = this.convertStringToUint8(this.hash.toString(this.HEX))[19] & 15;

    // Formatieren
    return (
      hash.substring(0, off * 2) +
      ' -> ' +
      hash.substring(off * 2, off * 2 + 8) +
      ' <- ' +
      hash.substring(off * 2 + 8, undefined)
    );
  }
}
