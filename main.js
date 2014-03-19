var width = 700;
var height = 500;
var pipe_velocity = 200;    
var game = new Phaser.Game(width, height, Phaser.AUTO, 'game_div');
var game_state = {};

var pipes_incoming = false,
    flag = false,
    count = 0,
    correct_option,
    bird_position,
    game_started = false;

/*Add questions and answers here !!*/
var data_string ="\
Question,Option One,Option Two;\
The child,Das Kind,Die Kind;\
The girl,Das Mädchen,Die Mädchen;\
The boy,Der Junge,Das Junge;\
A cow,Eine Kuh,Ein Kuh;\
Bitte,Please,Bitter;\
Danke,Thank you,Sorry;\
Machen,To make,To destroy;\
Auch,Also,Ouch;\
Pineapple,Ananas,Pingeappfle;\
Fahrt,Trip,Fart;\
Warum,Why,Warm \
";

var temp = data_string.split(';');
var data_arr =[]
for(i=0;i<temp.length;i++){
    data_arr.push(temp[i].split(","));
}

game_state.main = function() { };
game_state.main.prototype = {
   
    preload: function() {
        this.game.stage.backgroundColor = '#71c5cf';
        this.game.load.image('bird', 'assets/bird.png');  
        this.game.load.image('pipe', 'assets/pipe.png');
        this.game.load.image('ground', 'assets/ground.png');
        this.game.load.audio('flap', 'assets/flap.ogg');
        this.game.load.audio('music', 'assets/music.ogg');
        this.game.load.audio('point', 'assets/point.ogg');
        this.game.load.audio('nope', 'assets/nope.ogg');
        this.game.load.audio('die', 'assets/die.ogg');
    },

    create: function() { 
        this.bird = this.game.add.sprite(100, 105, 'bird');
        this.bird.anchor.setTo(-0.2, 0.5);
        
        var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        space_key.onDown.add(this.jump, this); 

        //add the pipes
        this.pipe = this.game.add.sprite(-width,height/2,'pipe');

        // Add ground tiles
        this.ground = game.add.tileSprite(0, game.world.height - 32, game.world.width, 32, 'ground');
        this.ground.tileScale.setTo(2, 2);
        
        // Timer that calls 'add_pipe' ever 4 seconds
        this.timer = this.game.time.events.loop(4000, this.add_pipe, this);
        
        // Add a score label on the top left of the screen
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ffffff" };
        this.label_score = this.game.add.text(20, 20, "0", style);
        
        //Add the text boxes to contain question and answers
        this.question_tb = this.add.text(-width, height/2, "", { font: "30px Arial", fill: "#ffffff" });
        this.option1_tb = this.add.text(-width, height/2, "", style);
        this.option2_tb = this.add.text(-width, height-90, "", style);

        this.instruction_tb = this.add.text(width/2-200, height/2-50, "Press Space Key to start the Game", style);
        this.result_tb = this.add.text(width, height/2-20, "Correct", { font: "20px Arial", fill: "#ffffff" });
        
        this.flap = game.add.audio('flap',0.1);
        this.point = game.add.audio('point',0.1);
        this.nope = game.add.audio('nope',0.1);
        this.die = game.add.audio('die',0.1);
        
        //Start the game on pressing the space key
        space_key.onDown.addOnce(this.start, this);
    },
    start: function(){
        game_started = true;
        this.bird.body.gravity.y = 1000;
        this.instruction_tb.position.x = -width;
    },
    // This function is called 60 times per second
    update: function() {
        if(game_started == false)
            return 0;
        if (this.bird.inWorld == false || this.bird.position.y > height - 40)
            this.game_over(); 
        this.game.physics.overlap(this.bird, this.pipe, this.game_over, null, this);
        this.game.physics.overlap(this.bird, this.ground, this.game_over, null, this);
        
        if(this.bird.position.y < height/2){    bird_position = 'up'; }
        else{ bird_position = 'down'; }
        
        if(this.option1_tb.position.x < 100 && flag == true)
            this.show_result(correct_option,bird_position);
        
        if (pipes_incoming == true)
            this.option1_tb.x -= pipe_velocity/60;
            this.question_tb.x -= pipe_velocity/60;
            this.option2_tb.x -= pipe_velocity/60;
        
        this.ground.tilePosition.x -= pipe_velocity/160;
        if (this.bird.angle < 20)
            this.bird.angle += 1;
        
    },
    game_over: function(){
        this.die.play();
        game_started = false;
        this.restart_game();
        var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        space_key.onDown.addOnce(this.start, this);
    },
    jump: function() {
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        this.game.add.tween(this.bird).to({angle: -20}, 100).start();
        this.flap.play();
    },

    restart_game: function() {
        this.game.time.events.remove(this.timer);
        this.game.state.start('main');
    },

    add_pipe: function() {
        if(game_started == false)
            return 0;
        var r = Math.floor(100 + Math.random()*60); 
        var n = Math.floor(Math.random()*2); //either 0 or 1
        
        this.pipe.reset(width,r,2);
        this.pipe.body.velocity.x = -pipe_velocity;
        
        this.question_tb.content = data_arr[count][0];
        this.option1_tb.content = data_arr[count][n+1];
        if(n ==0){
            this.option2_tb.content = data_arr[count][2];
            correct_option = 'up';
        } 
        else{
            this.option2_tb.content = data_arr[count][1];
            correct_option = 'down';
        }
        
        count = count >= data_arr.length-1 ? 0 : count+1;
        pipes_incoming = true;
        flag = true;
        this.option1_tb.position.x = width;
        this.question_tb.position.x = width+80;
        this.option2_tb.position.x = width;
        this.option1_tb.position.y = r/2-20;
        this.question_tb.position.y = r+100-20;
        this.option2_tb.position.y = (height+200+r)/2 -30;
    },
     show_result:function(op,bp) {
        flag = false;
        if(op == bp){
            this.score+=1;
            this.label_score.content = this.score;
            this.result_tb.content = "Correct";
            this.point.play();
        }
        else{
            this.result_tb.content = "Wrong";
            this.nope.play();
        }
        this.game.add.tween(this.result_tb).to({x:width/2}, 100).to({x:width/2}, 1000).to({x:width}, 100).start();
        //console.log(op,bp);
        this.option1_tb.x  = -width;
        this.question_tb.x  = -width;
        this.option2_tb.x  = -width;
    },
};

game.state.add('main', game_state.main);  
game.state.start('main'); 
