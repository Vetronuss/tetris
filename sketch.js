/*Changes made 9/2

==GAMEPLAY CHANGES==

  -added hard-drop feature
    -added f keybind
    -made step() return true if collison
  
  -added lose/restart game button
    -esc keybind by default

  -lose now sets key to NaN so held keys wont restart game
  
  -added delay to cementing

==VISUAL CHANGES==

  -added rotation_block var to stop drawing the black rotation block

  -Changed colors to match official tetris colors

  -added color vars to change colors easily (could be used to implement settings)
    -background stroke color
    -board background color
    -window background color
    -board border color
  
  -added out of bounds cover to stop from the pieces being visible above the board
  
  -added boxes around guis
  
  -added lines and level vars
  
  -changed you lose pop up
*/
var board=[];

var peices=[
  [[0,1],[0,2],[0,-1]],//line
  [[1,0],[-1,0],[0,1]],//T
  [[1,0],[0,1],[1,1]],//Square
  [[0,1],[1,1],[0,-1]],//L
  [[0,1],[-1,1],[0,-1]],//reverse L
  [[-1,0],[0,1],[1,1]],//Z
  [[1,0],[0,1],[-1,1]]//reverse Z
]
var pool=[0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];
var upcoming;
var upcoming_idx=0;

var cell_size=[30,30];
var cell_off=[50,50];

var step_time_base=500;//step time without drop, never altered.
var step_time_turbo=50;//step time with drop. never modified.
var step_time=500;//step time after difficulty mod.
var step_acc=0;
var delay = 0;
var delay_wait = 1
var max_delay = 5;
var max_delay_count = 0;

var drop_time=100;
var drop_acc=0;

var repeat_time=140;
var repeat_acc=0

var held_left=false;
var held_right=false;

var rot_left_keycode=38;
var rot_right_keycode=82;//r
var left_keycode=37;
var right_keycode=39;
var drop_keycode=40;
var hard_drop_keycode=70
var lose_keycode=27


//--VISUALS--
var rotation_block = false;
var background_stroke = [110,110,110]
var background_color = [128]
var window_background_color = [220]
var board_outline = [0]
var out_of_bounds_cover = true;
var colors=[
  ['cyan'],['purple'],[255,255,0],['orange'],['blue'],['red'],['lime']
]
//-----------

var difficulty_curve=0.8;//every stage, step_time is multiplied by this.
var stage_size=500;//how many points to advance a stage.

var current_peice={type:0,x:5,y:0,rot:0};
var score=0;
var scores = []
var score_names = []
var level = 0;
var lines = 0
var lost=false;
var crit_clear=false;//true if the last row clear cleared 4 rows
var turbo=false;//true if game is accelerated by holding down

function preload(){
  clearStorage()
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  new_game();
}
function new_game(){
  delay = 0;
  generate_upcoming();
  board=[];
  for(var x=0;x<10;x++){
    var column=[];
    for(var y=0;y<20;y++){
      column.push(-1);
    }
    board.push(column);
  }
  score=0;
  level = 0;
  lines = 0;
  drop_next_peice();
}

function step(){
  
  current_peice.y++;
  if(collision_check()){
    
    current_peice.y--;
    if (delay <= delay_wait-1 && max_delay_count <max_delay)
    {
      delay++;
      max_delay_count++
    }else
    {
      max_delay_count = 0
      delay = 0;
      cement_peice()
      clear_rows();
      drop_next_peice();
      if(collision_check())
      {
        lost=true;
      }
      return true
    }
    
    
    
    
    
    
    return false;
  }else
  {
    
    delay = 0;
    //update step time
    var stage=floor(score/stage_size);
    step_time=step_time_base;
    for(var n=0;n<stage;n++){
    step_time*=difficulty_curve;
    
    return false;
  }
  
  
  }
  
}

function keyPressed(){
  var did_move = false;
  if(lost && keyCode == 32){
    new_game();
    lost=false;
  }
  switch(keyCode){
    case left_keycode:
      did_move = move_left();
      held_left=true;
      if (delay > 0 && did_move == true)
      {
        delay--;
      }
      break;
    case right_keycode:
      did_move = move_right();
      held_right=true;
      if (delay > 0 && did_move == true)
      {
        delay--;
      }
      break;
    case rot_left_keycode:
      rotate_left();
      break;
    case rot_right_keycode:
      rotate_right();
      break;
    case drop_keycode:
      turbo=true;
      break;
    case lose_keycode:
      lost = true;
      break;
    case hard_drop_keycode:
      hard_drop();
      break;
  }
}

function hard_drop()
{
  
  while(step()!= true){}
  
}

function keyReleased(){
  if(keyCode==drop_keycode){
    turbo=false;
  }else if(keyCode==left_keycode){
    held_left=false;
    repeat_acc=0;
  }else if(keyCode==right_keycode){
    held_right=false;
    repeat_acc=0;
  }
}

function move_left(){
      current_peice.x--;
      if(collision_check()){
        current_peice.x++;
        return false
      }
      return true
}
function move_right(){
      current_peice.x++;
      if(collision_check()){
        current_peice.x--;
        return false
      }
  return true
}
function rotate_left(){
      if(current_peice.type==2){
        return;
      }
      current_peice.rot++;
      if(current_peice.rot>3){
        current_peice.rot=0;
      }
      if(current_peice.type==0||current_peice.type==5||current_peice.type==6){
        if(current_peice.rot>1){
          current_peice.rot=0;
        }
      }
      if(collision_check()){
        current_peice.rot--;
        if(current_peice.rot<0){
          if(current_peice.type==0||current_peice.type==5||current_peice.type==6){
            current_peice.rot=1;
          }else{
            current_peice.rot=3;
          }
        }
      }
  
}
function rotate_right(){
      if(current_peice.type==2){
        return;
      }
      current_peice.rot--;
      if(current_peice.rot<0){
        if(current_peice.type==0||current_peice.type==5||current_peice.type==6){
          current_peice.rot=1;
        }else{
          current_peice.rot=3;
        }
      }
      if(collision_check()){
        current_peice.rot++;
        if(current_peice.rot>3){
          current_peice.rot=3;
        }
        if(current_peice.type==0||current_peice.type==5||current_peice.type==6){
          if(current_peice.rot>1){
            current_peice.rot=0;
          }
        }
      }
  
}

function draw() {
  level = floor(score/stage_size)
  if(!lost){
    drop_acc+=deltaTime;
    if(drop_acc>drop_time){
      drop_rows();
      drop_acc=0;
    }
    if(held_left&&!held_right){
      repeat_acc+=deltaTime;
      if(repeat_acc>repeat_time){
        move_left();
        repeat_acc=0;
      }
    }
    
    if(held_right&&!held_left){
      repeat_acc+=deltaTime;
      if(repeat_acc>repeat_time){
        move_right();
        repeat_acc=0;
      }
    }
    step_acc+=deltaTime;
    if(step_acc>step_time||turbo&&step_acc>step_time_turbo){
      step();
      step_acc=0;
    }
  }
  background(window_background_color);
  
  
  for(var x=0;x<10;x++){
    for(var y=0;y<20;y++){
      draw_board(x,y);
    }
  }
  //draw board outline
  push();
  noFill();
  stroke(board_outline)
  rect(cell_off[0],cell_off[1],cell_size[0]*10,cell_size[1]*20)
  pop();
  
  
  draw_upcoming();
  draw_current_peice();
  
  if (out_of_bounds_cover == true)
  {
    push()
    fill(window_background_color)
    noStroke();
    rect(cell_off[0],0,cell_size[0]*10,cell_off[1]-1)
    pop()
  }
  //boxes for score
  push();
  fill(background_color)
  stroke(0)
  rect(cell_off[0]+cell_size[0]*10,cell_off[1],cell_size[0]*5, cell_size[1]*2)
  rect(cell_off[0]+cell_size[0]*10,cell_off[1]+cell_size[1]*2,cell_size[1]*5,cell_size[0]*2)
  rect(cell_off[0]+cell_size[0]*10,cell_off[1]+cell_size[1]*4,cell_size[1]*5,cell_size[0]*2)
  
 rect(cell_off[0]+cell_size[0]*10,cell_off[1]+cell_size[1]*6,cell_size[1]*4,cell_size[0]*1)
  pop();
  
  stroke(0);
  noFill();
  textAlign(LEFT, CENTER)
  fill(0)
  textSize(17)
  text("Up Next:",cell_off[0]+cell_size[0]*10+10,cell_off[1]+cell_size[1]*6.5); 
  textSize(20)
  
  text("Lines: "+lines,cell_off[0]+cell_size[0]*10+10,cell_off[1]+cell_size[1]*3);
  text("Level: "+level,cell_off[0]+cell_size[0]*10+10,cell_off[1]+cell_size[1]*5);
  text("Score: "+score,cell_off[0]+cell_size[0]*10+10,cell_off[1]+cell_size[1]);
  text("Delay: " + delay, 10,10)
  text("Max_delay_count: " + max_delay_count, 10,40)
  
  //lost screen
  if(lost){
    key = NaN
    stroke(0);
    fill(50)
    rect(cell_off[0]+cell_size[0]*5-100,cell_off[1]+cell_size[1]*5-50,200,100)
   rect(cell_off[0]+cell_size[0]*5-100,cell_off[1]+cell_size[1]*8.5-50,200,200)
    fill(230)
    textSize(30)
    textAlign(CENTER, CENTER)
    noStroke()
    
    //lost screen text
    text("You Lose",cell_off[0]+cell_size[0]*5,cell_off[1]+cell_size[1]*5);
    textSize(15)
    fill(200)
    text("Press space to continue...",cell_off[0]+cell_size[0]*5,cell_off[1]+cell_size[1]*6);
    textAlign(CENTER, CENTER)
    text("Name:",cell_off[0]+cell_size[0]*5-50,cell_off[1]+cell_size[1]*7.3 )
    text("Score:",cell_off[0]+cell_size[0]*5+50,cell_off[1]+cell_size[1]*7.3 )
    //render dividers
    push();
    stroke(70)
      line(cell_off[0]+cell_size[0]*5,cell_off[1]+cell_size[1]*7.3, cell_off[0]+cell_size[0]*5,cell_off[1]+cell_size[1]*13.1)
    line(cell_off[0]+cell_size[0]*8,cell_off[1]+cell_size[1]*7.8, cell_off[0]+cell_size[0]*2,cell_off[1]+cell_size[1]*7.8)
    pop();
    //render scores and names
    var score_list_length = 5
    
    if (getItem('stored_scores') == null){
      scores = [1000, 500];
      score_names = ["bob", "john"]
      storeItem('stored_scores',scores)
      storeItem('stored_names',score_names)
      
    }else
    { 
      
    scores = getItem('stored_scores')
    score_names = getItem('stored_names')
    }
    var name = "cooper";
    var text_x = cell_off[0]+cell_size[0]*5-50
    var text_y = cell_off[1]+cell_size[1]*7.3 
    var text_x2 = cell_off[0]+cell_size[0]*5+50
    //set scores and names
    for (var i = 0; i < scores.length; i++)
    {
      if (score >= scores[i])
      {
        scores.splice(i, 0, score)
        score_names.splice(i, 0, name)
      }
    }
    
    //display scores and names
    for (var i = 0; i < score_list_length; i++)
    {
      
      text(score_names[i], text_x,text_y+(cell_size[1]-5*i)*((i+1)/1))
      text(scores[i], text_x2,text_y+(cell_size[1]-5*i)*((i+1)/1))
    }
    
  }
}

function draw_board(x,y){
  
  var cell_pos=[cell_off[0]+x*cell_size[0],cell_off[1]+y*cell_size[1]];
  if(board[x][y]==-1){
      stroke(background_stroke)
      //noStroke();
      fill(background_color);
  }
  else if(board[x][y]>=0&&board[x][y]<pool.length){
    //noStroke();
    stroke(0);
    fill(colors[board[x][y]]);
  }else{
    stroke(0);
    fill(255,0,0);
  }
  
  rect(cell_pos[0],cell_pos[1],cell_size[0],cell_size[1]);
}

function draw_upcoming(){
  push();
  stroke(0)
  fill(background_color)
  rect(cell_off[0]+cell_size[0]*10,cell_off[1]+cell_size[1]*7,cell_size[1]*4,cell_size[0]*4)
  pop();
  var next=get_next_peice();
  draw_peice(next,cell_off[0]+cell_size[0]/2+cell_size[0]*11,cell_off[1]+cell_size[1]*8,0);
}

function draw_current_peice(){
  var cell_pos=[cell_off[0]+current_peice.x*cell_size[0],cell_off[1]+current_peice.y*cell_size[1]];
  draw_peice(current_peice.type,cell_pos[0],cell_pos[1],current_peice.rot);
}

function draw_peice(type,x,y,rot){
  //noStroke();
  stroke(0);
  fill(colors[type]);
  rect(x,y,cell_size[0],cell_size[1]);
  for(var n=0;n<peices[type].length;n++){
    switch(rot){
      case 0:
        rect(x+peices[type][n][0]*cell_size[0], y+peices[type][n][1]*cell_size[1], cell_size[0],cell_size[1]);
        break;
      case 1:
        rect(x+-peices[type][n][1]*cell_size[0], y+peices[type][n][0]*cell_size[1], cell_size[0],cell_size[1]);
        break;
      case 2:
        rect(x+-peices[type][n][0]*cell_size[0], y+-peices[type][n][1]*cell_size[1], cell_size[0],cell_size[1]);
        break;
      case 3:
        rect(x+peices[type][n][1]*cell_size[0], y+-peices[type][n][0]*cell_size[1], cell_size[0],cell_size[1]);
        break;
    }
  }
  if (rotation_block)
  {
    fill(0);
  rect(x+cell_size[0]/4,y+cell_size[1]/4,cell_size[0]/2,cell_size[1]/2);
  }
  
}

//clears a row if full
function clear_rows(){
  var num_clear=0;
  for(var row=0;row<20;row++){
    if(is_row_full(row)){
      for(var x=0;x<10;x++){
        board[x][row]=-1;
      }
      num_clear+=1;
    }
  }
  if(num_clear>=4){
    score+=800;
    
    if(crit_clear){
      score+=400;
      
    }
    crit_clear=true;
  }else{
    score+=100*num_clear;
    
    crit_clear=false;
  }
  if (num_clear > 0)
  {
    lines+= num_clear
  }
}

function is_row_full(row){
  for(var n=0;n<10;n++){
    if(board[n][row]==-1){
      return false;
    }
  }
  return true;
}

function is_row_clear(row){
  for(var n=0;n<10;n++){
    if(board[n][row]!=-1){
      return false;
    }
  }
  return true;
}

//drops rows, if necessary
function drop_rows(){
  var found_clear=false;
  for(var row=19;row>=0;row--){
    if(is_row_clear(row)&&!found_clear){
      found_clear=true;
    }
    if(found_clear){
      if(row==0){
        for(x=0;x<10;x++){
          board[x][row]=-1;
        }
      }
      else{
        for(x=0;x<10;x++){
          board[x][row]=board[x][row-1];
        }
      }
    }
  }
}

//returns true if colliding
function collision_check(){
  if(current_peice.x<0||current_peice.x>=10||current_peice.y<0||current_peice.y>=20||board[current_peice.x][current_peice.y]!=-1){
    return true;
  }
  for(var n=0;n<peices[current_peice.type].length;n++){
    var tile_pos=find_tile(n);
    if(tile_pos[0]<0 || tile_pos[0]>=10 || tile_pos[1]>=20 || (tile_pos[1]>0 && board[tile_pos[0]][tile_pos[1]]!=-1)){
      return true;
    }
  }
  return false;
}

function cement_peice(){
  board[current_peice.x][current_peice.y]=current_peice.type;
  for(var n=0;n<peices[current_peice.type].length;n++){
    var tile_pos=find_tile(n);
    board[tile_pos[0]][tile_pos[1]]=current_peice.type;
  }
}
//finds the board position of tile idx of the current peice
function find_tile(idx){
  var tile_pos=peices[current_peice.type][idx].slice();
    switch(current_peice.rot){
      case 0:
        //nothing needed
        break;
      case 1:
        tile_pos=[-tile_pos[1],tile_pos[0]];
        break;
      case 2:
        tile_pos=[-tile_pos[0],-tile_pos[1]];
        break;
      case 3:
        tile_pos=[tile_pos[1],-tile_pos[0]];
        break;
    }
    tile_pos[0]+=current_peice.x;
    tile_pos[1]+=current_peice.y;
  return tile_pos;
}

function drop_next_peice(){
  current_peice.type=get_next_peice();
  current_peice.x=5;
  current_peice.y=0;
  current_peice.rot=0;
  upcoming_idx++;
}

function generate_upcoming(){
  upcoming=pool.slice();
  for(var n=0;n<100;n++){
    var a=floor(random(0,pool.length));
    var b=floor(random(0,pool.length));
    var temp=upcoming[a];
    upcoming[a]=upcoming[b];
    upcoming[b]=temp;
  }
}
function get_next_peice(){
  if(upcoming_idx>=pool.length){
    upcoming_idx=0;
    generate_upcoming();
  }
  return upcoming[upcoming_idx];
}