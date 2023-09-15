import CharacterMng from "./CharacterMng.js";
import CollisionBox from "./CollisionBox.js";

export default class MainScene extends Phaser.Scene{

    constructor(){
        super({ key: 'mainScene' });

        this.isSoundPlaying;
        this.bgmSound;
        this.isGameOver = false;
    }
    init(message){
        if(message == 100)
        {
            this.isSoundPlaying= false;
        }
        else
        {
            this.isSoundPlaying= true;
        }
    }
    preload(){
        CharacterMng.preload(this);
    }

    create(){
        // 전역 변수에 사운드 객체들 할당
        this.load.audio("gameOver", 'assets/sounds/over.wav');

        this.bg = this.add.sprite(360,640,'mainbg').setDepth(-2); // 메인 배경
        this.zone = this.add.sprite(360,570,'zone').setDepth(-2); // 메인 배경

        //폰트스타일
        const fontStyle = {
            font: '60px myfont',
            fill: '#FF72AF',
            align: 'center',
            stroke: '#FF72AF', // 두껍게 효과를 주기 위해 stroke 속성 추가
            strokeThickness: 2.5,
        };

        //점수
        this.score = 0; 
        this.scoreText = this.add.text(340, 35, '0',fontStyle);


        this.characterMng = new CharacterMng(  
        {
            scene: this
        });
        this.characterMng.Init(); // 플레이어 생성과 충돌함수 들어있음

        // 충돌 박스 생성
        this.InitCollisionBox();
        
    }
    
    CreateBoxUP(){
        this.CollisionBoxUp = new CollisionBox(  
            {
                scene: this,
                x:  360,
                y : 145,
                width : 630,
                height: 30,
            });
            this.CollisionBoxUp.label = "Up";
    }
    CreateBoxDOWN(){
        this.CollisionBoxDown = new CollisionBox(
            {
                scene: this,
                x:  360,
                y : 996,
                width : 630,
                height: 30,
            });
            this.CollisionBoxDown.label = "Down"; 
    }
    CreateBoxLEFT(){
        this.CollisionBoxLeft = new CollisionBox(  
            {
                scene: this,
                x:  53,
                y : 571,
                width : 30,
                height: 820,
            });
            this.CollisionBoxLeft.label = "Left";
    }
    CreateBoxRIGHT(){
        this.CollisionBoxRight = new CollisionBox(  
            {
                scene: this,
                x:  667,
                y : 571,
                width : 30,
                height: 820,
            });
            this.CollisionBoxRight.label = "Right";
    }
    
    InitCollisionBox(){
        this.CreateBoxUP();
        this.CreateBoxDOWN();
        this.CreateBoxLEFT();
        this.CreateBoxRIGHT();
    }

    update(){
        this.characterMng.update();
    }

}