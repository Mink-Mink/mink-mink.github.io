'use strict';

let sum = (total : number, current : number) => {return Number(total) + Number(current)};
function getOccurenceCountsInArray(inputArray : Array<string | number>) {
    let CountMap = new Map();
    for (let element of inputArray) {
        if (CountMap.has(element)) {
            CountMap.set(element, CountMap.get(element) + 1);
        } else {
            CountMap.set(element, 1);
        }
    }
    return CountMap;
}

const redColor = "#f44336";
const greenColor = "#85ff89";
const yellowColor = "#ffe600";

function voteTokensToVotes(voteTokens : number) {
  return Math.floor(Math.sqrt(voteTokens));
}

type StringArray = Array<string>;
type VoteQuestion = {text: string, options: StringArray};
type Voter = {name: string,
    remainingVoteBudget: number,
    votes: Array<Array<number>>};
type EmptyObject = {};
type AppState = {
                    questionsToDecide: Array<VoteQuestion>,
                    voterList : Array<Voter>,
                    voteBudget : number,
                    currentVoterNumber: number,
                    voteState: string
                };

class App extends React.Component<EmptyObject, AppState> {
  constructor(props : any) {
    super(props);
    this.state = { questionsToDecide: [{text: "Best starter pokemon?", options: ["Charmander", "Squirtle", "Bulbasaur"]},
                                       {text: "Best caffeinated drink?", options: ["Coffee","Tea"]}],
                   voterList: [{name: "Voter 1", remainingVoteBudget: 0, votes: []},
                               {name: "Voter 2", remainingVoteBudget: 0, votes: []}],
                   voteBudget: 100,
                   currentVoterNumber: -1,
                   voteState: "Setup"};
  }

  addVoteQuestion() {
    this.state.questionsToDecide.push({ text: "", options: ["",""]})
    this.setState({questionsToDecide: this.state.questionsToDecide});
  }

  removeVoteQuestion(questionNumber : number) {
    let tempQuestions = this.state.questionsToDecide
    tempQuestions.splice(questionNumber, 1 );
    this.setState({questionsToDecide: tempQuestions});
  }

  addVoteOptionToQuestion(questionNumber : number) {
    this.state.questionsToDecide[questionNumber].options.push("");
    this.setState({questionsToDecide: this.state.questionsToDecide});
  }

  removeVoteOptionFromQuestion(questionNumber : number, optionNumber : number) {
    let targetQuestion = this.state.questionsToDecide[questionNumber];
    if (targetQuestion.options.length > 2) {
      targetQuestion.options.splice(optionNumber, 1);
      this.setState({questionsToDecide: this.state.questionsToDecide});
    }
  }

  onChangeQuestion(questionNumber : number, event : unknown) {
    this.state.questionsToDecide[questionNumber].text = event.target.value;
    this.setState({questionsToDecide: this.state.questionsToDecide});
  }

  onChangeOption(questionNumber : number, optionNumber : number, event : unknown) {
    this.state.questionsToDecide[questionNumber].options[optionNumber] = event.target.value;
    this.setState({questionsToDecide: this.state.questionsToDecide});
  }

  onAddVoter() {
    this.state.voterList.push({name: "", remainingVoteBudget: 0, votes: []});
    this.setState({voterList: this.state.voterList});
  }

  onRemoveVoter(voterNumber : number) {
    let tempVoters = this.state.voterList;
    if (tempVoters.length >= 2) {
      tempVoters.splice(voterNumber, 1 );
      this.setState({voterList: tempVoters});
    }
  }

  onChangeVoter(voterNumber : number, event : unknown) {
    this.state.voterList[voterNumber] = event.target.value;
    this.setState({voterList: this.state.voterList});
  }

  onEditVoteTotal(event : unknown) {
    this.setState({voteBudget: event.target.value});
  }

  startVote() {
    let newVoterList = this.state.voterList.map((voter) => {
      return {name: voter.name,
              remainingVoteBudget: this.state.voteBudget,
              votes: this.state.questionsToDecide.map((question) => {
                    return new Array(question.options.length).fill(0);})
      }});
    this.setState({currentVoterNumber: 0, voterList: newVoterList, voteState: "VoterSelection"});
  }

  onChangeVote( voterNumber : number, questionNumber : number, optionNumber : number, event) {
    let input = Number(event.target.value);
    const targetVoter = this.state.voterList[voterNumber];
    if ( input >= 0) {
      targetVoter.votes[questionNumber][optionNumber] = input;
    } else {
      targetVoter.votes[questionNumber][optionNumber] = 0;
    }
    let tokensSpent = this.getTotalVoteTokensSpent(voterNumber);
    targetVoter.remainingVoteBudget = this.state.voteBudget - tokensSpent;
    this.setState({voterList: this.state.voterList});
  }

  getTotalVoteTokensSpent(voterNumber : number) {
    return this.state.voterList[voterNumber].votes.reduce((total, current) => {return current.reduce(sum, 0) + total;} , 0);
  }

  countUpTheVote() {
      let voteFinished = false;
      if (!this.state.voterList.every((voter) => {return voter.remainingVoteBudget === 0;})) {
        voteFinished = confirm("Some voters have unspent vote tokens; Are you sure you want to close the vote?");
      }
      if (voteFinished) {
        this.setState({voteState: "VoteCount"});
      }
  }

  calculateTotalVotes(): Array<Array<number>> {
    let voteTotals = [];
    for (let questionNumber = 0; questionNumber < this.state.questionsToDecide.length; questionNumber++){
      voteTotals.push([]);
      for (let optionNumber = 0; optionNumber < this.state.questionsToDecide[questionNumber].options.length; optionNumber++) {
        voteTotals[questionNumber].push(0);
        for (const voter of this.state.voterList) {
          voteTotals[questionNumber][optionNumber] += voteTokensToVotes(voter.votes[questionNumber][optionNumber]);
        }
      }
    }
    return voteTotals;
  }

  resetVote() {
    this.setState({voteState: "Setup"});
  }

  getVoterButtonColor(voterNumber : number) {
      let currentVoter = this.state.voterList[voterNumber];
      if (currentVoter.remainingVoteBudget > 0) {
          return yellowColor;
      } else if (currentVoter.remainingVoteBudget === 0) {
          return greenColor;
      } else if (currentVoter.remainingVoteBudget < 0 ) {
          return redColor;
      }
  }

  returnToVoterSelection() {
      this.setState({voteState: "VoterSelection"});
  }

  showVoterBallot(voterNumber : number) {
      this.setState({currentVoterNumber: voterNumber, voteState: "Vote"});
  }

  render() {
    if (this.state.voteState === "Setup") {
      return (<div>
        <QuestionList questions = {this.state.questionsToDecide} 
                      onAddQuestion = {() => {this.addVoteQuestion()}}
                      onRemoveQuestion = {(i : number) => {this.removeVoteQuestion(i)}}
                      onAddOption = {(i : number) => {this.addVoteOptionToQuestion(i)}}
                      onRemoveOption = {(quest : number, opt : number) => {this.removeVoteOptionFromQuestion(quest, opt)}}
                      onChangeQuestion = {(quest : number, e) => {this.onChangeQuestion(quest, e)}}
                      onChangeOption = {(quest : number, opt : number, e) => {this.onChangeOption(quest, opt, e)}}/>
        <VoterList voterNameList = {this.state.voterList.map((voter) => {return voter.name;})}
                  onAddVoter = {() => {this.onAddVoter()}}
                  onRemoveVoter = {(voter : number) => {this.onRemoveVoter(voter)}}
                  onChangeVoter = {(voter : number, e) => {this.onChangeVoter(voter, e)}}/>
        <VotingBudget voteBudget = {this.state.voteBudget} onChange = {(e) => {this.onEditVoteTotal(e)}}/>
        <button onClick={() => {this.startVote()}}>Start the vote</button>
      </div>);
    } else if (this.state.voteState === "VoterSelection") {
        return (<div>
            <ol>
                {this.state.voterList.map((voter, counter) => {
                    return (<li>
                                <button onClick = {() => this.showVoterBallot(counter)} style = {{"backgroundColor" : this.getVoterButtonColor(counter)}}>{voter.name}</button>
                            </li>);
                })}
            </ol>
            <button onClick = {() => {this.countUpTheVote()}}>Count the votes</button>
        </div>);
    } else if (this.state.voteState === "Vote") {
      let currentVoter = this.state.voterList[this.state.currentVoterNumber];
      return (<div>
        <p>Currently voting {currentVoter.name}. Vote budget left: {currentVoter.remainingVoteBudget}</p>
        <Ballot questions = {this.state.questionsToDecide} 
                onChangeVote = {(quest : number, opt : number, e) => {this.onChangeVote(this.state.currentVoterNumber, quest, opt, e)}}
                votes = {currentVoter.votes}/>
        <button onClick={() => {this.returnToVoterSelection()}} style = {{"backgroundColor" : this.getVoterButtonColor(this.state.currentVoterNumber)}}>Submit the vote</button>
      </div>);
    } else {
      const voteTotals = this.calculateTotalVotes();
      return (<div>
        <p>Vote concluded. Final vote counts:</p>
        <VoteResults questions = {this.state.questionsToDecide} voteTotals = {voteTotals}/>
        <button onClick={() => {this.resetVote()}}>Start over?</button>
      </div>);
    };
  }
}

type QuestionListProps = {questions : Array<VoteQuestion>,
    onChangeOption : (question: number, option: number, e:unknown) => void,
    onRemoveOption : (question: number, option: number) => void,
    onAddOption: (question: number) => void,
    onChangeQuestion: (question: number, e:unknown) => void,
    onRemoveQuestion : (question: number) => void,
    onAddQuestion : () => void};
class QuestionList extends React.Component<QuestionListProps, EmptyObject> {
  render() {
    let questionTexts = [];
    let optionLists: Array<JSX.Element> = [];
    for (let questionNumber = 0; questionNumber < this.props.questions.length; questionNumber++) {
      const currentQuestion = this.props.questions[questionNumber];
      questionTexts.push(currentQuestion.text);
      optionLists.push(<VariableLengthList contentList = {currentQuestion.options} 
                                onChange = {(optionNumber : number, e) => {this.props.onChangeOption(questionNumber, optionNumber, e)}}
                                onRemove = {(optionNumber : number) => {this.props.onRemoveOption(questionNumber, optionNumber)}}
                                onAdd = {() => {this.props.onAddOption(questionNumber)}}
                                inputType = {"text"}/>);
    }
    return ( <div>
                <div>List of questions that will be voted on.</div>
                <VariableLengthList contentList = {questionTexts} 
                    onChange = {this.props.onChangeQuestion}
                    onRemove = {this.props.onRemoveQuestion}
                    onAdd = {this.props.onAddQuestion}
                    subLists = {optionLists}
                    inputType = {"text"}/>
            </div>);
  }
}

type VoterListProps = {voterNameList: Array<string>,
                        onChangeVoter :(counter: number, e:unknown) => void,
                        onRemoveVoter : (counter: number) => void,
                        onAddVoter : () => void};
class VoterList extends React.Component<VoterListProps, EmptyObject> {
  render() {
    return ( <div>
                <div>List of voters.</div>
                <VariableLengthList contentList = {this.props.voterNameList}
                    onChange = {this.props.onChangeVoter}
                    onRemove = {this.props.onRemoveVoter}
                    onAdd = {this.props.onAddVoter}
                    inputType = {"text"}/>
            </div>);
  }
}

type BallotProps = {questions: Array<VoteQuestion>,
                    votes: Array<Array<number>>,
                    onChangeVote: (counter:number, option:number, e: unknown) => void};
class Ballot extends React.Component<BallotProps, EmptyObject> {
  render() {
    return ( <div>
            <div>Please type in your allocated vote tokens in the appropriate boxes.</div>
            {this.props.questions.map((question : VoteQuestion, Counter : number) => {
              return <div>
                <p>{question.text}</p>
                <VariableLengthList contentList = {this.props.votes[Counter]}
                                    labels = {question.options.map((optionText : string, i) => {
                                      return optionText + "; Votes purchased: " + String(voteTokensToVotes(this.props.votes[Counter][i])) + " ";
                                    })} 
                                    onChange = {(optionNumber : number, e) => {this.props.onChangeVote(Counter, optionNumber, e)}}
                                    inputType = "number"
                                    />
            </div>})}
        </div>);
  }
}

type VoteResultsProps = {questions: Array<VoteQuestion>, voteTotals: Array<Array<number>>};
class VoteResults extends React.Component<VoteResultsProps, EmptyObject> {
  render() {
    return ( <div>
            {this.props.questions.map((question : VoteQuestion, Counter : number) => {
              return <div>
                <p>{question.text}</p>
                <ol>
                  {question.options.map((option, optionNumber) => {
                    let uniqueVoteCounts = getOccurenceCountsInArray(this.props.voteTotals[Counter]);
                    let maxVoteValue = Math.max(...this.props.voteTotals[Counter]);
                    let winnerColor = greenColor;
                    if (uniqueVoteCounts.get(maxVoteValue) != 1)  { // more than 1 winner
                      winnerColor = yellowColor;
                    }
                    if (this.props.voteTotals[Counter][optionNumber] === maxVoteValue) {
                        return <li style = {{"backgroundColor" : winnerColor}}>{option + "; Votes: " + String(this.props.voteTotals[Counter][optionNumber])}</li>;
                    } else {
                        return <li>{option + "; Votes: " + String(this.props.voteTotals[Counter][optionNumber])}</li>;
                    }})}
                </ol>
            </div>})}
        </div>);
  }
}

type VariableLengthListProps = {contentList: Array<number> | Array<string>,
    labels?: Array<string>,
    inputType: string,
    subLists?: Array<JSX.Element>,
    onChange:(counter: number, e:unknown) => void,
    onRemove? : (counter: number) => void,
    onAdd? : () => void};
class VariableLengthList extends React.Component<VariableLengthListProps, EmptyObject> {
  render () {
    return (
      <div>
        <ol>
          {this.props.contentList.map((value : string | number, Counter : number) => {
              return <li key = {Counter}>
                      <TextForm formValue = {value}
                                label = {this.props.labels ? this.props.labels[Counter] : null}
                                onChange = {(e) => this.props.onChange(Counter, e)}
                                onRemove = {this.props.onRemove ? () => {this.props.onRemove(Counter)} : null}
                                inputType = {this.props.inputType}/>
                      {this.props.subLists ? this.props.subLists[Counter] : null}
                    </li>
          })}
        </ol>
        {this.props.onAdd ? <button onClick={this.props.onAdd}>+</button> : null}
      </div>);
  }
}


type TextFormProps = {
                        label?: string,
                        inputType?: string,
                        formValue: string | number,
                        onChange: (e: any) => unknown,
                        onRemove?: (e: any) => unknown,
                    };
class TextForm extends React.Component<TextFormProps, EmptyObject> {
  render() {
    return ( <div>
              {this.props.label ? this.props.label : null}
              <label>
                <input type = {this.props.inputType ? this.props.inputType : "text"} 
                        value={this.props.formValue}
                        onChange={this.props.onChange}
                        size = {this.props.formValue.length}/>
                {this.props.onRemove ? <button onClick = {this.props.onRemove}>X</button> : null}  
              </label>
            </div>);
  }
}

type VoteBudgetProps = {voteBudget : number, onChange: (e:any) => unknown};
class VotingBudget extends React.Component<VoteBudgetProps, EmptyObject> {
  render() {
    return (<TextForm label = "Vote budget:" formValue = {this.props.voteBudget} onChange = {this.props.onChange} inputType = "number"/>);
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);