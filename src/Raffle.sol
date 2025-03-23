// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {VRFV2PlusClient} from "lib/chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol"; //Interface to interact with the Chainlink VRF Coordinator.

import {VRFConsumerBaseV2Plus} from "lib/chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol"; //Inherited class that ensures secure randomness in smart contracts

//VRFConsumerBaseV2Plus is an abstract contract
//Abstract contracts can have both defined and undefined functions

/**
 * @title A sample Raffle Contract
 * @author Anirudh
 * @notice This contract is for creating a sample raffle contract
 * @dev This implements the Chainlink VRF Version 2
 */
contract Raffle is VRFConsumerBaseV2Plus {
    /*Errors*/
    error Raffle__SendMoreToEnterRaffle();
    error Raffle__TransferFailed();
    error Raffle__RaffleNotOpen();
    error Raffle__UpkeepNotNeeded(uint256 balance, uint256 playersLength, uint256 raffleState);

    /*Type declarations*/
    enum RaffleState {
        OPEN, //0
        CALCULATING //1

    }

    /*State Variables*/
    // Chainlink VRF related variables
    bytes32 private immutable i_gasLane; //A key hash that determines the max gas price for VRF requests.
    uint256 private immutable i_subscriptionId; //Subscription ID for Chainlink VRF funding.
    uint16 private constant REQUEST_CONFIRMATIONS = 3; //Number of block confirmations before the request is fulfilled.
    uint32 private immutable i_callbackGasLimit; //Maximum gas used for callback (fulfillRandomWords).
    uint32 private constant NUM_WORDS = 1; //Number of random values requested

    uint256 private immutable i_entranceFee;
    ///@dev The duration of lottery in seconds
    uint256 private immutable i_interval;
    address payable[] private s_players;
    uint256 private s_lastTimeStamp;
    address private s_recentWinner;
    RaffleState private s_raffleState;

    //Events
    event RaffleEntered(address indexed player);
    event WinnerPicked(address indexed winner);
    event RequestedRaffleWinner(uint256 indexed requestId);

    constructor(
        uint256 _entranceFee,
        uint256 interval,
        address vrfCoordinator,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_entranceFee = _entranceFee;
        i_interval = interval;
        s_lastTimeStamp = block.timestamp;

        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
    }

    function enterRaffle() external payable {
        // require(msg.value >= i_entranceFee, "Not enough ETH sent!");
        // require(msg.value >= i_entranceFee, SendMoreToEnterRaffle());
        if (msg.value < i_entranceFee) {
            revert Raffle__SendMoreToEnterRaffle();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__RaffleNotOpen();
        }
        s_players.push(payable(msg.sender));
        emit RaffleEntered(msg.sender);
    }

    //when should the winner be picked
    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True
     * the following should be true for this to return true:
     * 1. The time interval has passed between raffle runs
     * 2. The lottery is open
     * 3. The contract has ETH
     * 4. Implicity, your subscription is funded with LINK
     * @param - ignored
     * @return upkeepNeeded - true if its time to restart the lottery
     * @return - ignored
     */
    function checkUpkeep(bytes memory /*checkData*/ )
        public
        view
        returns (bool upkeepNeeded, bytes memory /*performData*/ )
    {
        bool timeHasPassed = (block.timestamp - s_lastTimeStamp) >= i_interval;
        bool isOpen = s_raffleState == RaffleState.OPEN;
        bool hasBalance = address(this).balance > 0;
        bool hasPlayers = s_players.length > 0;

        upkeepNeeded = timeHasPassed && isOpen && hasBalance && hasPlayers;
        return (upkeepNeeded, "");
    }

    //1.Get a random number
    //2.Use a random number to pick a player
    //3.automatically called
    function performUpkeep(bytes calldata /* performData */ ) external {
        //check to see if enough time has passed
        (bool upkeepNeeded,) = checkUpkeep("");
        //whenever we use some type of variable inside a fn, it can nver be calldata
        //Because technically anything generated from a smart contract is never calldata
        //calldata can only be generated from a user's txn input
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(address(this).balance, s_players.length, uint256(s_raffleState));
        }

        s_raffleState = RaffleState.CALCULATING;
        //get our random number
        //1.request RNG(Random Number Generator)
        //2.get RNG
        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest({
            keyHash: i_gasLane,
            subId: i_subscriptionId,
            requestConfirmations: REQUEST_CONFIRMATIONS,
            callbackGasLimit: i_callbackGasLimit,
            numWords: NUM_WORDS,
            extraArgs: VRFV2PlusClient._argsToBytes(
                // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
            )
        });
        uint256 requestId = s_vrfCoordinator.requestRandomWords(request);
        //we get a requestId back from requestRandomWords
        //once we send the above requuest, the chanlink node will wait for some block confirmations and it will generate the random number and then its going to callback to fulfillRandomWords.
        //Its actually gonna call rawFullFillRandomWords which is gonna call fulfillRandomWords

        emit RequestedRaffleWinner(requestId); //this is redundant cuz our vrfCoordinator is also emitting this event
    }

    //CEI: Checks,Effects, Interactions pattern

    //This will be called by the `vrfCoordinator` when it sends back the requested `randomWords`. This is also where we'll select our winner!
    function fulfillRandomWords(uint256, /*requestId*/ uint256[] calldata randomWords) internal override {
        //Checks

        //s_players =10
        //rn = 12
        //12%10 = 2 whoever is at index 2 will be the random winner

        //Effects(Internal contract state changes)
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;

        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0); //new array of payable address with 0 length

        s_lastTimeStamp = block.timestamp;

        //Interactions(External contract interactions)
        (bool success,) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(s_recentWinner);
    }

    //getter functions
    function getEntranceFee() external view returns (uint256) {
        return i_entranceFee;
    }

    function getRaffleState() external view returns (RaffleState) {
        return s_raffleState;
    }

    function getPlayer(uint256 indexOfPlayer) external view returns (address) {
        return s_players[indexOfPlayer];
    }

    function getLastTimeStamp() external view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRecentWinner() external view returns (address) {
        return s_recentWinner;
    }
}
