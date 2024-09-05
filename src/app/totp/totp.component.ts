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
  public key!: crypto.lib.WordArray;
  public time!: crypto.lib.WordArray;
  public hash!: crypto.lib.WordArray;

  public HEX = crypto.enc.Hex;
  public off!: number;
  public REG = /.{1,4}/g;
  public val: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.key = crypto.lib.WordArray.random(20);
    this.updateTOTP();

    let currentTiming = 30000 - (Date.now() % 30000);

    setTimeout(() => {
      interval(30000).subscribe(_ => {
        this.updateTOTP();
      });
      this.updateTOTP();
    }, currentTiming + 50);


    this.val = Math.floor(currentTiming / 1000);
    const sub = interval(1000).subscribe(_ => {
      this.val--;
      if (this.val <= 0) {
        this.val = 30 + this.val;
      }
    });


  }

  private updateTOTP() {
    this.time = crypto.enc.Hex.parse(this.getEpochIteration());
    this.hash = crypto.HmacSHA1(this.time, this.key);
    this.off = this.convertStringToUint8(this.hash.toString(this.HEX))[19] & 15;
  }


  convertStringToUint8(hex: any): Uint8Array {
    return new Uint8Array(
      hex.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
    );
  }


  getEpochIteration(): string {
    const time = Math.floor(Date.now() / 1000 / 30);
    var ret = time.toString(16);
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

  getCalculatedNumber(format: boolean = false): string {
    var off = this.convertStringToUint8(this.hash.toString(this.HEX))[19] & 15;
    const hashcut = this.hash
      .toString(this.HEX)
      .substring(off * 2, off * 2 + 8);
    var numb = Number('0x' + hashcut);
    numb = numb & ~(1 << 31);
    var ret = (numb % 1000000).toString();

    if (format) {
      while (ret.length < 6) {
        ret = "0" + ret;
      }
      ret = ret.substring(0, 3) + " " + ret.substring(3, 6);
    }
    return ret;
  }


  formatHash(): string {
    var hash = this.hash.toString(this.HEX);
    var off = this.convertStringToUint8(this.hash.toString(this.HEX))[19] & 15;
    return (
      hash.substring(0, off * 2) +
      ' -> ' +
      hash.substring(off * 2, off * 2 + 8) +
      ' <- ' +
      hash.substring(off * 2 + 8, undefined)
    );
  }
}
